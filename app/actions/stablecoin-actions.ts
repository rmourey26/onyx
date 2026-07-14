"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  createStablecoinManager,
  type DeployStablecoinRequest,
  type StablecoinOperation,
} from "@/lib/blockchain/private-stablecoin"
import { revalidatePath } from "next/cache"

// ==================== Deploy Stablecoin ====================

export async function deployPrivateStablecoin(request: DeployStablecoinRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const result = await manager.deployStablecoin(request)

    if (result.success) {
      revalidatePath("/ai-suite/tokenization")
      revalidatePath("/ai-suite/stablecoins")
    }

    return result
  } catch (error) {
    console.error("[Stablecoin Action] Deploy error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deploy stablecoin",
    }
  }
}

// ==================== Mint Tokens ====================

export async function mintStablecoinTokens(operation: StablecoinOperation) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const result = await manager.mintTokens(operation)

    if (result.success) {
      revalidatePath("/ai-suite/stablecoins")
    }

    return result
  } catch (error) {
    console.error("[Stablecoin Action] Mint error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mint tokens",
    }
  }
}

// ==================== Burn Tokens ====================

export async function burnStablecoinTokens(operation: StablecoinOperation) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const result = await manager.burnTokens(operation)

    if (result.success) {
      revalidatePath("/ai-suite/stablecoins")
    }

    return result
  } catch (error) {
    console.error("[Stablecoin Action] Burn error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to burn tokens",
    }
  }
}

// ==================== Transfer Tokens ====================

export async function transferStablecoinTokens(operation: StablecoinOperation) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const result = await manager.transferTokens(operation)

    if (result.success) {
      revalidatePath("/ai-suite/stablecoins")
    }

    return result
  } catch (error) {
    console.error("[Stablecoin Action] Transfer error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to transfer tokens",
    }
  }
}

// ==================== Freeze/Unfreeze Account ====================

export async function freezeStablecoinAccount(
  stablecoinId: string,
  targetAddress: string,
  freeze: boolean,
  reason: string,
) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const result = await manager.freezeAccount(stablecoinId, targetAddress, freeze, reason)

    if (result.success) {
      revalidatePath("/ai-suite/stablecoins")
    }

    return result
  } catch (error) {
    console.error("[Stablecoin Action] Freeze error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update account status",
    }
  }
}

// ==================== Whitelist Management ====================

export async function updateStablecoinWhitelist(stablecoinId: string, address: string, add: boolean) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const result = await manager.updateWhitelist(stablecoinId, address, add)

    if (result.success) {
      revalidatePath("/ai-suite/stablecoins")
    }

    return result
  } catch (error) {
    console.error("[Stablecoin Action] Whitelist error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update whitelist",
    }
  }
}

// ==================== Get User Stablecoins ====================

export async function getUserStablecoins(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const stablecoins = await manager.getUserStablecoins(userId)

    return {
      success: true,
      data: stablecoins,
    }
  } catch (error) {
    console.error("[Stablecoin Action] Get stablecoins error:", error)
    return {
      success: false,
      error: "Failed to fetch stablecoins",
      data: [],
    }
  }
}

// ==================== Get Stablecoin Details ====================

export async function getStablecoinDetails(stablecoinId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const stablecoin = await manager.getStablecoin(stablecoinId)
    const holders = await manager.getHolders(stablecoinId)
    const operations = await manager.getOperationHistory(stablecoinId, 20)

    return {
      success: true,
      data: {
        stablecoin,
        holders,
        recentOperations: operations,
      },
    }
  } catch (error) {
    console.error("[Stablecoin Action] Get details error:", error)
    return {
      success: false,
      error: "Failed to fetch stablecoin details",
      data: null,
    }
  }
}

// ==================== Get Operation History ====================

export async function getStablecoinOperations(stablecoinId: string, limit = 50) {
  try {
    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const operations = await manager.getOperationHistory(stablecoinId, limit)

    return {
      success: true,
      data: operations,
    }
  } catch (error) {
    console.error("[Stablecoin Action] Get operations error:", error)
    return {
      success: false,
      error: "Failed to fetch operations",
      data: [],
    }
  }
}
