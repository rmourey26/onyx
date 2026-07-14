"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ==================== Schemas ====================

export const createOfferSchema = z.object({
  poolId: z.string().uuid(),
  fractionCount: z.number().int().positive(),
  offerPrice: z.number().positive(),
  userId: z.string().uuid(),
  expiresAt: z.string().optional(),
})

export const acceptOfferSchema = z.object({
  offerId: z.string().uuid(),
  userId: z.string().uuid(),
})

export const rejectOfferSchema = z.object({
  offerId: z.string().uuid(),
  userId: z.string().uuid(),
})

export const transferTokenSchema = z.object({
  tokenId: z.string().uuid(),
  recipientAddress: z.string().min(1),
  userId: z.string().uuid(),
})

export const listForSaleSchema = z.object({
  tokenId: z.string().uuid(),
  pricePerFraction: z.number().positive(),
  userId: z.string().uuid(),
})

// ==================== Token Trading Functions ====================

/**
 * Create a buy offer for fractional tokens
 */
export async function createBuyOffer(formData: z.infer<typeof createOfferSchema>) {
  try {
    const validated = createOfferSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    // Verify pool exists and has available fractions
    const { data: pool, error: poolError } = await supabase
      .from("fractionalization_pools")
      .select("*")
      .eq("id", validated.poolId)
      .single()

    if (poolError || !pool) {
      return {
        success: false,
        error: "Fractionalization pool not found",
      }
    }

    if (validated.fractionCount > pool.available_fractions) {
      return {
        success: false,
        error: `Only ${pool.available_fractions} fractions available`,
      }
    }

    // Create offer record
    const { data: offer, error: offerError } = await supabase
      .from("token_offers")
      .insert({
        pool_id: validated.poolId,
        buyer_id: validated.userId,
        fraction_count: validated.fractionCount,
        offer_price: validated.offerPrice,
        total_price: validated.offerPrice * validated.fractionCount,
        status: "pending",
        expires_at: validated.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
      })
      .select()
      .single()

    if (offerError) {
      console.error("Error creating offer:", offerError)
      return {
        success: false,
        error: "Failed to create offer",
      }
    }

    revalidatePath("/ai-suite/tokenization")

    return {
      success: true,
      data: offer,
    }
  } catch (error) {
    console.error("Error in createBuyOffer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create offer",
    }
  }
}

/**
 * Accept a buy offer (seller action)
 */
export async function acceptOffer(formData: z.infer<typeof acceptOfferSchema>) {
  try {
    const validated = acceptOfferSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    // Get offer details
    const { data: offer, error: offerError } = await supabase
      .from("token_offers")
      .select("*, fractionalization_pools!inner(*, asset_tokens!inner(user_id))")
      .eq("id", validated.offerId)
      .eq("status", "pending")
      .single()

    if (offerError || !offer) {
      return {
        success: false,
        error: "Offer not found or no longer available",
      }
    }

    // Verify the user is the owner of the asset
    const assetOwnerId = offer.fractionalization_pools.asset_tokens.user_id
    if (assetOwnerId !== validated.userId) {
      return {
        success: false,
        error: "Only the asset owner can accept offers",
      }
    }

    // Check if offer has expired
    if (new Date(offer.expires_at) < new Date()) {
      await supabase.from("token_offers").update({ status: "expired" }).eq("id", validated.offerId)

      return {
        success: false,
        error: "Offer has expired",
      }
    }

    // Update offer status
    const { error: updateError } = await supabase
      .from("token_offers")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", validated.offerId)

    if (updateError) {
      return {
        success: false,
        error: "Failed to accept offer",
      }
    }

    // Create fractional ownership record for buyer
    const { data: ownership, error: ownershipError } = await supabase
      .from("fractional_ownerships")
      .insert({
        pool_id: offer.pool_id,
        user_id: offer.buyer_id,
        fraction_count: offer.fraction_count,
        ownership_percentage: (offer.fraction_count / offer.fractionalization_pools.total_fractions) * 100,
        purchase_price: offer.total_price,
        tx_hash: `offer_${validated.offerId}`, // In production, this would be a blockchain tx
      })
      .select()
      .single()

    if (ownershipError) {
      console.error("Error creating ownership:", ownershipError)
      return {
        success: false,
        error: "Failed to transfer ownership",
      }
    }

    // Update pool available fractions
    await supabase
      .from("fractionalization_pools")
      .update({
        available_fractions: offer.fractionalization_pools.available_fractions - offer.fraction_count,
      })
      .eq("id", offer.pool_id)

    // Record transaction history
    await supabase.from("token_transactions").insert({
      pool_id: offer.pool_id,
      from_user_id: validated.userId,
      to_user_id: offer.buyer_id,
      fraction_count: offer.fraction_count,
      price: offer.total_price,
      transaction_type: "sale",
      status: "completed",
    })

    revalidatePath("/ai-suite/tokenization")

    return {
      success: true,
      data: ownership,
    }
  } catch (error) {
    console.error("Error in acceptOffer:", error)
    return {
      success: false,
      error: "Failed to accept offer",
    }
  }
}

/**
 * Reject a buy offer (seller action)
 */
export async function rejectOffer(formData: z.infer<typeof rejectOfferSchema>) {
  try {
    const validated = rejectOfferSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    // Get offer details to verify ownership
    const { data: offer, error: offerError } = await supabase
      .from("token_offers")
      .select("*, fractionalization_pools!inner(*, asset_tokens!inner(user_id))")
      .eq("id", validated.offerId)
      .eq("status", "pending")
      .single()

    if (offerError || !offer) {
      return {
        success: false,
        error: "Offer not found or no longer available",
      }
    }

    // Verify the user is the owner of the asset
    const assetOwnerId = offer.fractionalization_pools.asset_tokens.user_id
    if (assetOwnerId !== validated.userId) {
      return {
        success: false,
        error: "Only the asset owner can reject offers",
      }
    }

    // Update offer status to rejected
    const { error: updateError } = await supabase
      .from("token_offers")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", validated.offerId)

    if (updateError) {
      return {
        success: false,
        error: "Failed to reject offer",
      }
    }

    revalidatePath("/ai-suite/tokenization")

    return {
      success: true,
      message: "Offer rejected successfully",
    }
  } catch (error) {
    console.error("Error in rejectOffer:", error)
    return {
      success: false,
      error: "Failed to reject offer",
    }
  }
}

/**
 * Transfer token to another address
 */
export async function transferToken(formData: z.infer<typeof transferTokenSchema>) {
  try {
    const validated = transferTokenSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    // Verify token ownership
    const { data: token, error: tokenError } = await supabase
      .from("asset_tokens")
      .select("*")
      .eq("id", validated.tokenId)
      .eq("user_id", validated.userId)
      .single()

    if (tokenError || !token) {
      return {
        success: false,
        error: "Token not found or access denied",
      }
    }

    // Update token owner
    const { error: updateError } = await supabase
      .from("asset_tokens")
      .update({
        wallet_address: validated.recipientAddress,
      })
      .eq("id", validated.tokenId)

    if (updateError) {
      return {
        success: false,
        error: "Failed to transfer token",
      }
    }

    // Record transfer in history
    await supabase.from("token_transfer_history").insert({
      token_id: validated.tokenId,
      from_address: token.wallet_address,
      to_address: validated.recipientAddress,
      tx_hash: `transfer_${Date.now()}`, // In production, this would be the blockchain tx hash
      transfer_type: "gift",
    })

    revalidatePath("/ai-suite/tokenization")

    return {
      success: true,
      message: "Token transferred successfully",
    }
  } catch (error) {
    console.error("Error in transferToken:", error)
    return {
      success: false,
      error: "Failed to transfer token",
    }
  }
}

/**
 * List token for sale
 */
export async function listTokenForSale(formData: z.infer<typeof listForSaleSchema>) {
  try {
    const validated = listForSaleSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    // Verify token ownership
    const { data: token, error: tokenError } = await supabase
      .from("asset_tokens")
      .select("*")
      .eq("id", validated.tokenId)
      .eq("user_id", validated.userId)
      .single()

    if (tokenError || !token) {
      return {
        success: false,
        error: "Token not found or access denied",
      }
    }

    // Create marketplace listing
    const { data: listing, error: listingError } = await supabase
      .from("token_marketplace_listings")
      .insert({
        token_id: validated.tokenId,
        seller_id: validated.userId,
        price_per_fraction: validated.pricePerFraction,
        status: "active",
      })
      .select()
      .single()

    if (listingError) {
      return {
        success: false,
        error: "Failed to create listing",
      }
    }

    revalidatePath("/ai-suite/tokenization")

    return {
      success: true,
      data: listing,
    }
  } catch (error) {
    console.error("Error in listTokenForSale:", error)
    return {
      success: false,
      error: "Failed to list token",
    }
  }
}

/**
 * Get all pending offers for a user's assets
 */
export async function getUserOffers(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Fetch all offers with full nested data
    const { data: allOffers, error } = await supabase
      .from("token_offers")
      .select(
        `
        *,
        fractionalization_pools (
          *,
          asset_tokens (
            *,
            assets (*)
          )
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    // Filter client-side to include:
    // 1. Offers where the user is the buyer
    // 2. Offers for assets owned by the user
    const filteredOffers = (allOffers || []).filter((offer) => {
      // User is the buyer
      if (offer.buyer_id === userId) return true
      
      // User owns the asset being offered on
      if (offer.fractionalization_pools?.asset_tokens?.user_id === userId) return true
      
      return false
    })

    return {
      success: true,
      data: filteredOffers,
    }
  } catch (error) {
    console.error("Error getting user offers:", error)
    return {
      success: false,
      error: "Failed to fetch offers",
      data: [],
    }
  }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("token_transactions")
      .select(
        `
        *,
        fractionalization_pools (
          *,
          asset_tokens (
            *,
            assets (*)
          )
        )
      `,
      )
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error("Error getting transaction history:", error)
    return {
      success: false,
      error: "Failed to fetch transactions",
      data: [],
    }
  }
}

/**
 * Get marketplace listings
 */
export async function getMarketplaceListings() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("token_marketplace_listings")
      .select(
        `
        *,
        asset_tokens (
          *,
          assets (*)
        )
      `,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error("Error getting marketplace listings:", error)
    return {
      success: false,
      error: "Failed to fetch listings",
      data: [],
    }
  }
}

/**
 * Cancel an offer
 */
export async function cancelOffer(offerId: string, userId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from("token_offers")
      .update({ status: "cancelled" })
      .eq("id", offerId)
      .eq("buyer_id", userId)
      .eq("status", "pending")

    if (error) {
      return {
        success: false,
        error: "Failed to cancel offer",
      }
    }

    revalidatePath("/ai-suite/tokenization")

    return {
      success: true,
      message: "Offer cancelled successfully",
    }
  } catch (error) {
    console.error("Error cancelling offer:", error)
    return {
      success: false,
      error: "Failed to cancel offer",
    }
  }
}
