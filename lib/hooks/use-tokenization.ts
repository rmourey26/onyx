"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tokenizeAsset } from "@/app/actions/asset-tokenization-actions"
import { createBuyOffer, acceptOffer, rejectOffer } from "@/app/actions/token-trading-actions"
import { toast } from "sonner"

// Hook for tokenizing an asset
export function useTokenizeAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      assetId: string
      tokenType: "nft" | "coin"
      tokenName: string
      tokenSymbol?: string
      tokenSupply?: number
      fractionalize?: boolean
      fractionCount?: number
      walletAddress: string
    }) => {
      const result = await tokenizeAsset(
        params.assetId,
        params.tokenType,
        params.tokenName,
        params.tokenSymbol,
        params.tokenSupply,
        params.fractionalize,
        params.fractionCount,
        params.walletAddress,
      )

      if (!result.success) {
        throw new Error(result.error || "Failed to tokenize asset")
      }

      return result
    },
    onSuccess: () => {
      toast.success("Asset tokenized successfully")
      queryClient.invalidateQueries({ queryKey: ["tokenized-assets"] })
      queryClient.invalidateQueries({ queryKey: ["tokenization-metrics"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to tokenize asset")
    },
  })
}

// Hook for creating a buy offer
export function useCreateBuyOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      tokenizedAssetId: string
      quantity: number
      pricePerToken: number
      expiresIn?: number
    }) => {
      const result = await createBuyOffer(
        params.tokenizedAssetId,
        params.quantity,
        params.pricePerToken,
        params.expiresIn,
      )

      if (!result.success) {
        throw new Error(result.error || "Failed to create buy offer")
      }

      return result
    },
    onSuccess: () => {
      toast.success("Buy offer created successfully")
      queryClient.invalidateQueries({ queryKey: ["token-offers"] })
      queryClient.invalidateQueries({ queryKey: ["tokenization-metrics"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create buy offer")
    },
  })
}

// Hook for accepting an offer
export function useAcceptOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { offerId: string; walletAddress: string }) => {
      const result = await acceptOffer(params.offerId, params.walletAddress)

      if (!result.success) {
        throw new Error(result.error || "Failed to accept offer")
      }

      return result
    },
    onSuccess: () => {
      toast.success("Offer accepted successfully")
      queryClient.invalidateQueries({ queryKey: ["token-offers"] })
      queryClient.invalidateQueries({ queryKey: ["token-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["fractional-ownership"] })
      queryClient.invalidateQueries({ queryKey: ["tokenization-metrics"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept offer")
    },
  })
}

// Hook for rejecting an offer
export function useRejectOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (offerId: string) => {
      const result = await rejectOffer(offerId)

      if (!result.success) {
        throw new Error(result.error || "Failed to reject offer")
      }

      return result
    },
    onSuccess: () => {
      toast.success("Offer rejected")
      queryClient.invalidateQueries({ queryKey: ["token-offers"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject offer")
    },
  })
}
