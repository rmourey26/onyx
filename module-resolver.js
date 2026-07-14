/**
 * Module Resolver for Sui TypeScript SDK 2.0
 * 
 * This resolver handles legacy imports and ensures compatibility with SDK 2.0.
 * It replaces old package paths, client imports, and deprecated function names.
 * 
 * SDK 2.0 Breaking Changes Handled:
 * - @mysten/sui/client → @mysten/sui/jsonRpc
 * - SuiClient → SuiJsonRpcClient
 * - getFullnodeUrl → getJsonRpcFullnodeUrl
 * 
 * @param {string} source - The source code to transform
 * @returns {string} - The transformed source code
 */
module.exports = (source) => {
  return source
    // SDK 2.0: Replace client imports with jsonRpc imports
    .replace(/from ['"]@mysten\/sui\/client['"]/g, "from '@mysten/sui/jsonRpc'")
    
    // SDK 2.0: Replace deprecated class and function names
    .replace(/\bSuiClient\b/g, "SuiJsonRpcClient")
    .replace(/\bgetFullnodeUrl\b/g, "getJsonRpcFullnodeUrl")
    
    // Replace legacy @mysten/sui.js imports with new @mysten/sui imports
    .replace(/from ['"]@mysten\/sui\.js\/utils['"]/g, "from '@mysten/sui/utils'")
    .replace(/from ['"]@mysten\/sui\.js\/client['"]/g, "from '@mysten/sui/jsonRpc'")
    .replace(/from ['"]@mysten\/sui\.js\/transactions['"]/g, "from '@mysten/sui/transactions'")
    .replace(/from ['"]@mysten\/sui\.js['"]/g, "from '@mysten/sui'")
    
    // Replace deprecated function names
    .replace(/\bfromB64\b/g, "fromBase64")
    .replace(/\btoB64\b/g, "toBase64")
}
