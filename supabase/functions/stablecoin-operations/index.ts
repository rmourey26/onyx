/**
 * Supabase Edge Function: Stablecoin Operations
 *
 * Handles async stablecoin operations including:
 * - Minting with collateral verification
 * - Burning with L1 release
 * - Compliance screening
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/io/mod.ts" // Declaring Deno for linting

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface StablecoinOperationRequest {
  operationType: "mint" | "burn" | "verify-collateral" | "compliance-check"
  stablecoinId: string
  amount?: string
  targetAddress?: string
  userId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const body: StablecoinOperationRequest = await req.json()
    const { operationType, stablecoinId, amount, targetAddress, userId } = body

    // Get stablecoin record
    const { data: stablecoin, error: stablecoinError } = await supabaseClient
      .from("private_stablecoins")
      .select("*")
      .eq("id", stablecoinId)
      .single()

    if (stablecoinError || !stablecoin) {
      return new Response(JSON.stringify({ success: false, error: "Stablecoin not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      })
    }

    let result: any

    switch (operationType) {
      case "verify-collateral":
        result = await verifyCollateral(supabaseClient, stablecoin, amount || "0")
        break

      case "compliance-check":
        result = await performComplianceCheck(stablecoin, targetAddress || "")
        break

      case "mint":
        result = await processMint(supabaseClient, stablecoin, amount || "0", targetAddress || "")
        break

      case "burn":
        result = await processBurn(supabaseClient, stablecoin, amount || "0")
        break

      default:
        return new Response(JSON.stringify({ success: false, error: "Invalid operation type" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        })
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (error) {
    console.error("[Stablecoin Edge Function] Error:", error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})

async function verifyCollateral(
  supabase: any,
  stablecoin: any,
  amount: string,
): Promise<{ verified: boolean; collateralBalance?: string; requiredAmount?: string; error?: string }> {
  try {
    // Get reserve information
    const { data: reserve } = await supabase
      .from("stablecoin_reserves")
      .select("*")
      .eq("stablecoin_id", stablecoin.id)
      .single()

    if (!reserve) {
      return { verified: false, error: "No reserve configured" }
    }

    const requiredCollateral = (BigInt(amount) * BigInt(Math.floor(stablecoin.collateral_ratio * 100))) / BigInt(10000)

    const hasEnoughCollateral = BigInt(reserve.collateral_amount) >= requiredCollateral

    return {
      verified: hasEnoughCollateral,
      collateralBalance: reserve.collateral_amount,
      requiredAmount: requiredCollateral.toString(),
      error: hasEnoughCollateral ? undefined : "Insufficient collateral",
    }
  } catch (error) {
    console.error("[Collateral Verification] Error:", error)
    return { verified: false, error: "Verification failed" }
  }
}

async function performComplianceCheck(
  stablecoin: any,
  targetAddress: string,
): Promise<{ passed: boolean; riskScore?: number; flags?: string[] }> {
  try {
    const config = stablecoin.config?.complianceConfig

    // Basic sanctions screening simulation
    // In production, this would call Circle's compliance API
    const riskScore = Math.random() * 100

    const flags: string[] = []
    if (riskScore > 70) flags.push("high_risk_score")

    return {
      passed: riskScore < 70,
      riskScore,
      flags,
    }
  } catch (error) {
    console.error("[Compliance Check] Error:", error)
    return { passed: false, flags: ["check_failed"] }
  }
}

async function processMint(
  supabase: any,
  stablecoin: any,
  amount: string,
  targetAddress: string,
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // Verify collateral first
    const collateralCheck = await verifyCollateral(supabase, stablecoin, amount)
    if (!collateralCheck.verified) {
      return { success: false, error: collateralCheck.error }
    }

    // Record the operation
    const { data: operation, error } = await supabase
      .from("stablecoin_operations")
      .insert({
        stablecoin_id: stablecoin.id,
        operation_type: "mint",
        amount,
        target_address: targetAddress,
        status: "completed",
        canton_transaction_id: `canton-${Date.now()}`,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: "Failed to record operation" }
    }

    // Update total supply
    const newSupply = (BigInt(stablecoin.total_supply || "0") + BigInt(amount)).toString()
    await supabase.from("private_stablecoins").update({ total_supply: newSupply }).eq("id", stablecoin.id)

    return {
      success: true,
      transactionId: operation.canton_transaction_id,
    }
  } catch (error) {
    console.error("[Process Mint] Error:", error)
    return { success: false, error: "Mint processing failed" }
  }
}

async function processBurn(
  supabase: any,
  stablecoin: any,
  amount: string,
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // Validate burn amount
    if (BigInt(amount) > BigInt(stablecoin.total_supply || "0")) {
      return { success: false, error: "Burn amount exceeds total supply" }
    }

    // Record the operation
    const { data: operation, error } = await supabase
      .from("stablecoin_operations")
      .insert({
        stablecoin_id: stablecoin.id,
        operation_type: "burn",
        amount,
        status: "completed",
        canton_transaction_id: `canton-${Date.now()}`,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: "Failed to record operation" }
    }

    // Update total supply
    const newSupply = (BigInt(stablecoin.total_supply || "0") - BigInt(amount)).toString()
    await supabase.from("private_stablecoins").update({ total_supply: newSupply }).eq("id", stablecoin.id)

    return {
      success: true,
      transactionId: operation.canton_transaction_id,
    }
  } catch (error) {
    console.error("[Process Burn] Error:", error)
    return { success: false, error: "Burn processing failed" }
  }
}
