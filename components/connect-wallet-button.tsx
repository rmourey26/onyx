"use client"

import { ConnectButton } from "@mysten/dapp-kit"

/**
 * A simplified wallet connection button that leverages the all-in-one
 * ConnectButton from @mysten/dapp-kit. It handles all connection states,
 * displays the connected address, and provides a disconnect option.
 */
export function ConnectWalletButton() {
  return <ConnectButton />
}
