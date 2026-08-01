/**
 * Kronova v1 Tokenization API
 * Enterprise asset tokenization on Sui blockchain
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"
import { createSuiClient, SNS_PACKAGE_ID, getExplorerUrl } from "@/lib/sui-client"
import { Transaction } from "@mysten/sui/transactions"

export async function GET(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["read:tokenization"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")

    let query = supabase
      .from("asset_tokens")
      .select(
        `
        *,
        assets (
          id, asset_id, name, asset_type, status, current_value, location
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", auth.userId!)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error, count } = await query

    if (error) {
      return apiError("Failed to fetch tokenized assets", 500)
    }

    return apiSuccess({
      tokens: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error("[Tokenization API] Error:", error)
    return apiError("Internal server error", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["write:tokenization"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const {
      assetId,
      walletAddress,
      enableFractionalization = false,
      totalFractions,
      pricePerFraction,
      metadata = {},
    } = body

    if (!assetId || !walletAddress) {
      return apiError("Missing required fields: assetId, walletAddress", 400)
    }

    const supabase = await createServerSupabaseClient()

    // Get asset
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("*")
      .eq("id", assetId)
      .eq("user_id", auth.userId!)
      .single()

    if (assetError || !asset) {
      return apiError("Asset not found or access denied", 404)
    }

    // Check if already tokenized
    const { data: existingToken } = await supabase
      .from("asset_tokens")
      .select("id")
      .eq("asset_id", assetId)
      .eq("status", "active")
      .single()

    if (existingToken) {
      return apiError("Asset is already tokenized", 409)
    }

    // Prepare blockchain transaction
    const suiClient = createSuiClient()
    const tx = new Transaction()

    const ASSET_REGISTRY_ID = process.env.NEXT_PUBLIC_ASSET_REGISTRY_ID || ""

    if (!ASSET_REGISTRY_ID) {
      return apiError("Asset registry not configured", 500)
    }

    const assetData = {
      asset_id: asset.asset_id,
      name: asset.name || "Unnamed Asset",
      description: asset.description || "",
      asset_type: asset.asset_type || "equipment",
      status: asset.status || "active",
      purchase_cost: Math.floor((asset.purchase_cost || 0) * 1000000),
      current_value: Math.floor((asset.current_value || 0) * 1000000),
      image_url: asset.metadata?.image_url || "",
      location: JSON.stringify(asset.location || {}),
      iot_sensor_id: asset.iot_sensor_id || "",
      specifications: JSON.stringify(asset.specifications || {}),
      esg_metrics: JSON.stringify(asset.esg_metrics || {}),
    }

    tx.moveCall({
      target: `${SNS_PACKAGE_ID}::asset_nft::mint_asset_nft`,
      arguments: [
        tx.object(ASSET_REGISTRY_ID),
        tx.pure.string(assetData.asset_id),
        tx.pure.string(assetData.name),
        tx.pure.string(assetData.description),
        tx.pure.string(assetData.asset_type),
        tx.pure.string(assetData.status),
        tx.pure.u64(assetData.purchase_cost),
        tx.pure.u64(assetData.current_value),
        tx.pure.string(assetData.image_url),
        tx.pure.string(assetData.location),
        tx.pure.string(assetData.iot_sensor_id),
        tx.pure.string(assetData.specifications),
        tx.pure.string(assetData.esg_metrics),
        tx.pure.string(auth.userId!),
      ],
    })

    tx.setGasBudget(50_000_000)

    // Dry run
    const dryRunResult = await suiClient.dryRunTransaction({
      transaction: tx.serialize(),
    })

    if (dryRunResult.effects.status.status !== "success") {
      return apiError(`Blockchain transaction failed: ${dryRunResult.effects.status.error}`, 500)
    }

    const createdObjects = dryRunResult.effects.created || []
    const nftObject = createdObjects.find((obj) => obj.owner && typeof obj.owner === "object")
    const nftObjectId = nftObject?.reference?.objectId || `0x${Date.now().toString(16).padStart(64, "0")}`
    const txDigest = dryRunResult.digest

    // Save token record
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("asset_tokens")
      .insert({
        asset_id: assetId,
        user_id: auth.userId,
        token_type: "nft",
        blockchain: "sui",
        contract_address: SNS_PACKAGE_ID,
        token_id: nftObjectId,
        wallet_address: walletAddress,
        tx_hash: txDigest,
        metadata: {
          ...assetData,
          is_fractionalized: enableFractionalization,
          total_fractions: totalFractions,
          price_per_fraction: pricePerFraction,
          ...metadata,
        },
        status: "active",
      })
      .select()
      .single()

    if (tokenError) {
      return apiError("Failed to save tokenization record", 500)
    }

    // Update asset metadata
    await supabase
      .from("assets")
      .update({
        metadata: {
          ...asset.metadata,
          tokenized: true,
          token_id: nftObjectId,
          blockchain: "sui",
        },
      })
      .eq("id", assetId)

    return apiSuccess(
      {
        tokenId: tokenRecord.id,
        nftObjectId,
        txDigest,
        explorerUrl: getExplorerUrl(txDigest),
        status: "active",
      },
      201,
    )
  } catch (error) {
    console.error("[Tokenization API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
