"use client"

/**
 * Sui Client Hooks - SDK 2.0
 * 
 * Client-side network configuration using createNetworkConfig helper.
 * This file uses React hooks and must only be imported in client components.
 * 
 * SDK 2.0 Migration:
 * - getFullnodeUrl → getJsonRpcFullnodeUrl (from @mysten/sui/jsonRpc)
 */
import { createNetworkConfig } from "@mysten/dapp-kit"
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc"
import { 
  SNS_PACKAGE_ID, 
  SNS_REGISTRY_ID, 
  CURRENT_NETWORK,
  type NetworkType 
} from "./sui-client"

// Client-side network configuration using createNetworkConfig helper
// This file uses React hooks and must only be imported in client components
export const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  mainnet: {
    url: getJsonRpcFullnodeUrl("mainnet"),
    variables: {
      snsPackageId: SNS_PACKAGE_ID,
      snsRegistryId: SNS_REGISTRY_ID,
    },
  },
  testnet: {
    url: getJsonRpcFullnodeUrl("testnet"),
    variables: {
      snsPackageId: SNS_PACKAGE_ID,
      snsRegistryId: SNS_REGISTRY_ID,
    },
  },
  devnet: {
    url: getJsonRpcFullnodeUrl("devnet"),
    variables: {
      snsPackageId: SNS_PACKAGE_ID,
      snsRegistryId: SNS_REGISTRY_ID,
    },
  },
  localnet: {
    url: "http://127.0.0.1:9000",
    variables: {
      snsPackageId: SNS_PACKAGE_ID,
      snsRegistryId: SNS_REGISTRY_ID,
    },
  },
})

// Re-export for convenience
export { CURRENT_NETWORK, type NetworkType }
