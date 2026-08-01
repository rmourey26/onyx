/**
 * Kronova v1 Fractionalization API
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"
import { createSuiClient, SNS_PACKAGE_ID } from "@/lib/sui-client"
import { Transaction } from "@mysten/sui/transactions"

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["write:tokenization"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const { tokenId, totalFractions, pricePerFraction } = body

    if (!tokenId || !totalFractions || !pricePerFraction) {
      return apiError("Missing required fields: tokenId, totalFractions, pricePerFraction", 400)
    }

    const supabase = await createServerSupabaseClient()

    const { data: token, error: tokenError } = await supabase
      .from("asset_tokens")
      .select("*")
      .eq("id", tokenId)
      .eq("user_id", auth.userId!)
      .single()

    if (tokenError || !token) {
      return apiError("Token not found", 404)
    }

    if (token.metadata?.is_fractionalized) {
      return apiError("Token is already fractionalized", 409)
    }

    const suiClient = createSuiClient()
    const tx = new Transaction()

    tx.moveCall({
      target: `${SNS_PACKAGE_ID}::asset_nft::fractionalize_asset`,
      arguments: [
        tx.object(token.token_id),
        tx.pure.u64(totalFractions),
        tx.pure.u64(Math.floor(pricePerFraction * 1000000)),
      ],
    })

    tx.setGasBudget(30_000_000)

    const dryRunResult = await suiClient.dryRunTransaction({
      transaction: tx.serialize(),
    })

    if (dryRunResult.effects.status.status !== "success") {
      return apiError("Fractionalization transaction failed", 500)
    }

    const poolObject = dryRunResult.effects.created?.[0]
    const poolId = poolObject?.reference?.objectId || `pool_${Date.now()}`

    const { data: poolRecord, error: poolError } = await supabase
      .from("fractionalization_pools")
      .insert({
        asset_token_id: tokenId,
        pool_id: poolId,
        total_fractions: totalFractions,
        available_fractions: totalFractions,
        price_per_fraction: pricePerFraction,
        status: "active",
      })
      .select()
      .single()

    if (poolError) {
      return apiError("Failed to create fractionalization pool", 500)
    }

    await supabase
      .from("asset_tokens")
      .update({
        metadata: {
          ...token.metadata,
          is_fractionalized: true,
          fractionalization_pool_id: poolId,
          total_fractions: totalFractions,
          price_per_fraction: pricePerFraction,
        },
      })
      .eq("id", tokenId)

    return apiSuccess(
      {
        poolId: poolRecord.id,
        blockchainPoolId: poolId,
        totalFractions,
        pricePerFraction,
      },
      201,
    )
  } catch (error) {
    console.error("[Fractionalization API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
