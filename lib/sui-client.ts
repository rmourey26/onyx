/**
 * Sui Client Configuration - SDK 2.0
 * 
 * This module provides server-side Sui client creation using the new
 * SuiJsonRpcClient from @mysten/sui/jsonRpc (SDK 2.0).
 * 
 * Key SDK 2.0 Changes:
 * - SuiClient → SuiJsonRpcClient (from @mysten/sui/jsonRpc)
 * - getFullnodeUrl → getJsonRpcFullnodeUrl (from @mysten/sui/jsonRpc)
 * - network parameter is now required in client constructor
 */
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc"

export const SNS_PACKAGE_ID = process.env.NEXT_PUBLIC_SNS_PACKAGE_ID || "0x0"
export const SNS_REGISTRY_ID = process.env.NEXT_PUBLIC_SNS_REGISTRY_ID || "0x0"

// Network type for environment variable
export type NetworkType = "mainnet" | "testnet" | "devnet" | "localnet"

// Get the current network from environment
export const CURRENT_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 
  process.env.SUI_NETWORK || 
  "testnet") as NetworkType

// Network URL mapping for server-side use (no React dependencies)
export function getNetworkUrl(network: NetworkType): string {
  if (network === "localnet") {
    return "http://127.0.0.1:9000"
  }
  return getJsonRpcFullnodeUrl(network)
}

// Network variables for each environment
export const networkVariables = {
  mainnet: { snsPackageId: SNS_PACKAGE_ID, snsRegistryId: SNS_REGISTRY_ID },
  testnet: { snsPackageId: SNS_PACKAGE_ID, snsRegistryId: SNS_REGISTRY_ID },
  devnet: { snsPackageId: SNS_PACKAGE_ID, snsRegistryId: SNS_REGISTRY_ID },
  localnet: { snsPackageId: SNS_PACKAGE_ID, snsRegistryId: SNS_REGISTRY_ID },
}

// Create a standalone SuiJsonRpcClient for server-side usage (SDK 2.0)
// This function is safe to use in API routes and server components
// Note: SDK 2.0 requires explicit network parameter
export function createSuiClient(network?: NetworkType) {
  const targetNetwork = network || CURRENT_NETWORK
  return new SuiJsonRpcClient({
    url: getNetworkUrl(targetNetwork),
    network: targetNetwork, // Required in SDK 2.0
  })
}

export function getExplorerUrl(txDigest: string) {
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet"
  const baseUrl =
    network === "mainnet"
      ? "https://suiscan.xyz/mainnet/tx"
      : network === "devnet"
        ? "https://suiscan.xyz/devnet/tx"
        : "https://suiscan.xyz/testnet/tx"

  return `${baseUrl}/${txDigest}`
}

export function getObjectExplorerUrl(objectId: string) {
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet"
  const baseUrl =
    network === "mainnet"
      ? "https://suiscan.xyz/mainnet/object"
      : network === "devnet"
        ? "https://suiscan.xyz/devnet/object"
        : "https://suiscan.xyz/testnet/object"

  return `${baseUrl}/${objectId}`
}
