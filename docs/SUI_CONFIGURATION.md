# Sui TypeScript SDK 2.0 Configuration

## Current Setup (Production-Ready)

### Packages
- **@mysten/sui**: `^2.0.0` - TypeScript SDK 2.0 with JSON-RPC client
- **@mysten/dapp-kit**: `^0.20.0` - Stable dApp Kit for React integration
- **@mysten/bcs**: `^1.0.4` - Binary Canonical Serialization

### Breaking Changes in SDK 2.0

**Important Migration Notes:**
1. `SuiClient` → `SuiJsonRpcClient`
2. `getFullnodeUrl` → `getJsonRpcFullnodeUrl`
3. Imports: `@mysten/sui/client` → `@mysten/sui/jsonRpc`
4. **Required `network` parameter** when creating clients
5. **ESM Only** - All `@mysten/*` packages are now ESM only

### TypeScript Configuration (Required for SDK 2.0)

The tsconfig.json must use `NodeNext` module resolution for ESM compatibility:

```json
{
  "compilerOptions": {
    "moduleResolution": "NodeNext",
    "module": "NodeNext"
  }
}
```

### Architecture

#### Network Configuration (`/lib/sui-client.ts`)
Uses `createNetworkConfig` helper with SDK 2.0 API:

```typescript
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc"
import { createNetworkConfig } from "@mysten/dapp-kit"

export const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  mainnet: { url: getJsonRpcFullnodeUrl("mainnet"), variables: { ... } },
  testnet: { url: getJsonRpcFullnodeUrl("testnet"), variables: { ... } },
  devnet: { url: getJsonRpcFullnodeUrl("devnet"), variables: { ... } },
  localnet: { url: "http://127.0.0.1:9000", variables: { ... } }
})

// SDK 2.0 requires network parameter
export function createSuiClient(network?: NetworkType) {
  const targetNetwork = network || CURRENT_NETWORK
  return new SuiJsonRpcClient({
    url: getJsonRpcFullnodeUrl(targetNetwork),
    network: targetNetwork  // Required in 2.0
  })
}
```

**Network Variables:**
- `snsPackageId` - Sui Name Service package ID
- `snsRegistryId` - Sui Name Service registry ID

#### Provider Setup

**Primary Provider** (`/components/client-providers.tsx`):
- Wraps entire app with QueryClient, SuiClientProvider, and WalletProvider
- Optimized QueryClient configuration (5min stale time, no window refocus)
- Auto-connect disabled for better UX control

**Secondary Provider** (`/components/providers/sui-provider.tsx`):
- Available for component-level Sui context
- Includes ReactQueryDevtools in development
- Same network configuration as primary

#### Module Resolution (`/module-resolver.js`)
Handles legacy package migrations for backward compatibility:
- `@mysten/sui.js/*` → `@mysten/sui/*`
- `@mysten/sui.js/client` → `@mysten/sui/jsonRpc` (SDK 2.0)
- `@mysten/sui.js/transactions` → `@mysten/sui/transactions`
- `fromB64` → `fromBase64`
- `toB64` → `toBase64`

### Components Using Sui SDK

1. **`connect-wallet-button.tsx`** - Wallet connection UI
2. **`sui-wallet-status.tsx`** - Current account display
3. **`sui-nft-card.tsx`** - NFT display with queries
4. **`sui-nft-mint-modal.tsx`** - NFT minting transactions
5. **`tokenize-asset-dialog.tsx`** - Asset tokenization

### Environment Variables

Required variables (already configured):
- `NEXT_PUBLIC_SUI_NETWORK` - Network selection (mainnet/testnet/devnet/localnet)
- `NEXT_PUBLIC_SNS_PACKAGE_ID` - Sui Name Service package ID
- `NEXT_PUBLIC_SNS_REGISTRY_ID` - Sui Name Service registry ID

### Best Practices Implemented

1. **Network-Specific Variables**: Use `useNetworkVariable` hook to access network-specific config
2. **Type Safety**: Proper TypeScript types for all network configurations
3. **Server/Client Separation**: `createSuiClient()` for server-side operations
4. **Query Optimization**: Configured QueryClient with appropriate stale times
5. **Module Transpilation**: Next.js config includes Sui packages in transpilePackages

### Common Hooks

```typescript
// Get current connected account
const account = useCurrentAccount()

// Execute transactions
const { mutate: signAndExecute } = useSignAndExecuteTransaction()

// Query Sui client
const { data } = useSuiClientQuery('getObject', { id: objectId })

// Get SuiClient instance
const client = useSuiClient()

// Access network variables
const packageId = useNetworkVariable('snsPackageId')
```

### Transaction Pattern

```typescript
const tx = new Transaction()
tx.moveCall({
  target: `${packageId}::module::function`,
  arguments: [/* ... */],
})

signAndExecute(
  { transaction: tx },
  {
    onSuccess: (result) => console.log('Success:', result),
    onError: (error) => console.error('Error:', error),
  }
)
```

## Troubleshooting

### Build Errors
- Ensure `transpilePackages` in `next.config.mjs` includes Sui packages
- Verify no legacy packages (`@mysten/wallet-kit`, `@mysten/sui.js`) in package.json

### Network Issues
- Check environment variables are set correctly
- Verify network URLs are accessible
- Use correct network for deployed smart contracts

### Type Errors
- Ensure `@mysten/sui` and `@mysten/dapp-kit` versions are compatible
- Check that Transaction imports come from `@mysten/sui/transactions`

## SDK 2.0 Migration Guide

### Key API Changes

**Before (SDK 1.x):**
```typescript
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client"

const client = new SuiClient({
  url: getFullnodeUrl("devnet")
})
```

**After (SDK 2.0):**
```typescript
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc"

const client = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl("devnet"),
  network: "devnet"  // Now required
})
```

### Other SDK 2.0 Changes

1. **Commands** → **TransactionCommands** (React Native compatibility)
2. **ExecutionStatus**: `Failed` → `Failure` in BCS schemas
3. **GraphQL**: Unified schema (no more versioned schemas)
4. **Experimental APIs**: Moved to stable `@mysten/sui/client`

### Removed Legacy Packages
- `@mysten/wallet-kit` (replaced by WalletProvider in dapp-kit)
- `@mysten/sui.js` (replaced by @mysten/sui)
- `@mysten/dapp-kit-react` (doesn't exist, use @mysten/dapp-kit)

### Module Resolver
The module-resolver.js file automatically handles legacy import transformations during build time, so older code continues to work without manual updates.
