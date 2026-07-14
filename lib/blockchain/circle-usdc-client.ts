/**
 * Circle USDC Integration Client
 *
 * Enterprise-grade integration with Circle's APIs for USDC operations
 * Supports xReserve for Canton Network USDC tokens
 *
 * Reference: https://docs.digitalasset.com/usdc/xreserve/overview.html
 */

import { z } from "zod"
import crypto from "crypto"

// ==================== Configuration ====================

export interface CircleConfig {
  apiKey: string
  apiUrl: string
  environment: "sandbox" | "production"
  entityId?: string
  walletSetId?: string
}

const CIRCLE_API_URLS = {
  sandbox: "https://api-sandbox.circle.com",
  production: "https://api.circle.com",
}

// ==================== Schemas ====================

export const circleWalletSchema = z.object({
  walletId: z.string(),
  entityId: z.string(),
  type: z.enum(["end_user_wallet", "merchant_wallet", "developer_wallet"]),
  description: z.string().optional(),
  balances: z.array(
    z.object({
      amount: z.string(),
      currency: z.string(),
    }),
  ),
})

export const circleTransferSchema = z.object({
  id: z.string(),
  source: z.object({
    type: z.string(),
    id: z.string(),
  }),
  destination: z.object({
    type: z.string(),
    id: z.string(),
    address: z.string().optional(),
    chain: z.string().optional(),
  }),
  amount: z.object({
    amount: z.string(),
    currency: z.string(),
  }),
  status: z.enum(["pending", "complete", "failed"]),
  createDate: z.string(),
})

export const xReserveMintRequestSchema = z.object({
  amount: z.string(),
  sourceChain: z.enum(["ETH", "AVAX", "SOL", "MATIC", "ARB", "OP", "BASE"]),
  sourceAddress: z.string(),
  destinationPartyId: z.string(), // Canton Network party ID
  idempotencyKey: z.string().optional(),
})

export const xReserveBurnRequestSchema = z.object({
  amount: z.string(),
  sourcePartyId: z.string(), // Canton Network party ID
  destinationChain: z.enum(["ETH", "AVAX", "SOL", "MATIC", "ARB", "OP", "BASE"]),
  destinationAddress: z.string(),
  idempotencyKey: z.string().optional(),
})

export type CircleWallet = z.infer<typeof circleWalletSchema>
export type CircleTransfer = z.infer<typeof circleTransferSchema>
export type XReserveMintRequest = z.infer<typeof xReserveMintRequestSchema>
export type XReserveBurnRequest = z.infer<typeof xReserveBurnRequestSchema>

// ==================== Circle USDC Client ====================

export class CircleUSDCClient {
  private config: CircleConfig
  private baseUrl: string

  constructor(config: Partial<CircleConfig> = {}) {
    const environment = config.environment || (process.env.NODE_ENV === "production" ? "production" : "sandbox")

    this.config = {
      apiKey: config.apiKey || process.env.CIRCLE_API_KEY || "",
      apiUrl: config.apiUrl || CIRCLE_API_URLS[environment],
      environment,
      entityId: config.entityId || process.env.CIRCLE_ENTITY_ID,
      walletSetId: config.walletSetId || process.env.CIRCLE_WALLET_SET_ID,
    }

    this.baseUrl = this.config.apiUrl
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
    }
  }

  /**
   * Generate idempotency key
   */
  private generateIdempotencyKey(): string {
    return crypto.randomUUID()
  }

  // ==================== Wallet Operations ====================

  /**
   * Create a new wallet
   */
  async createWallet(
    description: string,
    type: "end_user_wallet" | "merchant_wallet" = "end_user_wallet",
  ): Promise<CircleWallet | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/wallets`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          idempotencyKey: this.generateIdempotencyKey(),
          description,
          type,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[Circle] Create wallet failed:", error)
        return null
      }

      const data = await response.json()
      return circleWalletSchema.parse(data.data)
    } catch (error) {
      console.error("[Circle] Error creating wallet:", error)
      return null
    }
  }

  /**
   * Get wallet by ID
   */
  async getWallet(walletId: string): Promise<CircleWallet | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/wallets/${walletId}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return circleWalletSchema.parse(data.data)
    } catch (error) {
      console.error("[Circle] Error getting wallet:", error)
      return null
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletId: string): Promise<{ amount: string; currency: string }[]> {
    try {
      const wallet = await this.getWallet(walletId)
      return wallet?.balances || []
    } catch (error) {
      console.error("[Circle] Error getting wallet balance:", error)
      return []
    }
  }

  // ==================== Transfer Operations ====================

  /**
   * Create a transfer between wallets
   */
  async createTransfer(
    sourceWalletId: string,
    destinationWalletId: string,
    amount: string,
    currency = "USD",
  ): Promise<CircleTransfer | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/transfers`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          idempotencyKey: this.generateIdempotencyKey(),
          source: {
            type: "wallet",
            id: sourceWalletId,
          },
          destination: {
            type: "wallet",
            id: destinationWalletId,
          },
          amount: {
            amount,
            currency,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[Circle] Create transfer failed:", error)
        return null
      }

      const data = await response.json()
      return circleTransferSchema.parse(data.data)
    } catch (error) {
      console.error("[Circle] Error creating transfer:", error)
      return null
    }
  }

  /**
   * Get transfer by ID
   */
  async getTransfer(transferId: string): Promise<CircleTransfer | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/transfers/${transferId}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return circleTransferSchema.parse(data.data)
    } catch (error) {
      console.error("[Circle] Error getting transfer:", error)
      return null
    }
  }

  // ==================== xReserve Operations (Canton Network USDC) ====================

  /**
   * Mint USDC on Canton Network via xReserve
   * Locks USDC on L1 chain and creates equivalent token on Canton Network
   *
   * Reference: https://docs.digitalasset.com/usdc/xreserve/workflows.html
   */
  async mintCantonUSDC(request: XReserveMintRequest): Promise<{
    success: boolean
    transactionId?: string
    cantonContractId?: string
    error?: string
  }> {
    try {
      const validated = xReserveMintRequestSchema.parse(request)

      // Step 1: Lock USDC on source chain via xReserve contract
      const lockResponse = await fetch(`${this.baseUrl}/v1/xreserve/lock`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          idempotencyKey: validated.idempotencyKey || this.generateIdempotencyKey(),
          amount: validated.amount,
          sourceChain: validated.sourceChain,
          sourceAddress: validated.sourceAddress,
          destinationNetwork: "canton",
          destinationPartyId: validated.destinationPartyId,
        }),
      })

      if (!lockResponse.ok) {
        const error = await lockResponse.json()
        return {
          success: false,
          error: error.message || "Failed to lock USDC on source chain",
        }
      }

      const lockData = await lockResponse.json()

      // Step 2: Wait for Canton Network token creation confirmation
      const mintConfirmation = await this.waitForCantonMint(lockData.data.transactionId)

      if (!mintConfirmation.success) {
        return {
          success: false,
          error: "Canton Network token creation timed out",
        }
      }

      return {
        success: true,
        transactionId: lockData.data.transactionId,
        cantonContractId: mintConfirmation.contractId,
      }
    } catch (error) {
      console.error("[Circle] Error minting Canton USDC:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to mint Canton USDC",
      }
    }
  }

  /**
   * Burn USDC on Canton Network and release on L1 chain
   */
  async burnCantonUSDC(request: XReserveBurnRequest): Promise<{
    success: boolean
    transactionId?: string
    l1TransactionHash?: string
    error?: string
  }> {
    try {
      const validated = xReserveBurnRequestSchema.parse(request)

      // Step 1: Burn token on Canton Network
      const burnResponse = await fetch(`${this.baseUrl}/v1/xreserve/burn`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          idempotencyKey: validated.idempotencyKey || this.generateIdempotencyKey(),
          amount: validated.amount,
          sourceNetwork: "canton",
          sourcePartyId: validated.sourcePartyId,
          destinationChain: validated.destinationChain,
          destinationAddress: validated.destinationAddress,
        }),
      })

      if (!burnResponse.ok) {
        const error = await burnResponse.json()
        return {
          success: false,
          error: error.message || "Failed to burn Canton USDC",
        }
      }

      const burnData = await burnResponse.json()

      // Step 2: Wait for L1 release confirmation
      const releaseConfirmation = await this.waitForL1Release(burnData.data.transactionId)

      return {
        success: true,
        transactionId: burnData.data.transactionId,
        l1TransactionHash: releaseConfirmation.txHash,
      }
    } catch (error) {
      console.error("[Circle] Error burning Canton USDC:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to burn Canton USDC",
      }
    }
  }

  /**
   * Wait for Canton Network mint confirmation
   */
  private async waitForCantonMint(
    transactionId: string,
    maxAttempts = 30,
    intervalMs = 2000,
  ): Promise<{ success: boolean; contractId?: string }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/v1/xreserve/status/${transactionId}`, {
          method: "GET",
          headers: this.getHeaders(),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.data.status === "complete" && data.data.cantonContractId) {
            return { success: true, contractId: data.data.cantonContractId }
          }
          if (data.data.status === "failed") {
            return { success: false }
          }
        }
      } catch (error) {
        console.error("[Circle] Error checking mint status:", error)
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    return { success: false }
  }

  /**
   * Wait for L1 release confirmation
   */
  private async waitForL1Release(
    transactionId: string,
    maxAttempts = 30,
    intervalMs = 2000,
  ): Promise<{ success: boolean; txHash?: string }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/v1/xreserve/status/${transactionId}`, {
          method: "GET",
          headers: this.getHeaders(),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.data.status === "complete" && data.data.l1TransactionHash) {
            return { success: true, txHash: data.data.l1TransactionHash }
          }
          if (data.data.status === "failed") {
            return { success: false }
          }
        }
      } catch (error) {
        console.error("[Circle] Error checking release status:", error)
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    return { success: false }
  }

  // ==================== Compliance Operations ====================

  /**
   * Screen address for sanctions/compliance
   */
  async screenAddress(
    address: string,
    chain: string,
  ): Promise<{
    passed: boolean
    riskScore: number
    flags: string[]
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/compliance/screening`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          address,
          chain,
        }),
      })

      if (!response.ok) {
        return { passed: false, riskScore: 100, flags: ["screening_failed"] }
      }

      const data = await response.json()
      return {
        passed: data.data.riskScore < 70,
        riskScore: data.data.riskScore,
        flags: data.data.flags || [],
      }
    } catch (error) {
      console.error("[Circle] Error screening address:", error)
      return { passed: false, riskScore: 100, flags: ["screening_error"] }
    }
  }

  /**
   * Get USDC balance on specific chain
   */
  async getChainBalance(
    chain: "ETH" | "AVAX" | "SOL" | "MATIC" | "ARB" | "OP" | "BASE",
    address: string,
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/balances?chain=${chain}&address=${address}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        return "0"
      }

      const data = await response.json()
      const usdcBalance = data.data.balances?.find((b: any) => b.currency === "USDC" || b.currency === "USD")
      return usdcBalance?.amount || "0"
    } catch (error) {
      console.error("[Circle] Error getting chain balance:", error)
      return "0"
    }
  }
}

// ==================== Singleton Instance ====================

let circleClientInstance: CircleUSDCClient | null = null

export function getCircleClient(config?: Partial<CircleConfig>): CircleUSDCClient {
  if (!circleClientInstance || config) {
    circleClientInstance = new CircleUSDCClient(config)
  }
  return circleClientInstance
}
