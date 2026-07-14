"use client"

import { Button } from "@/components/ui/button"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { Wallet } from "lucide-react"

export function SuiWalletStatus() {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()

  if (!currentAccount) {
    return (
      <div className="flex flex-col gap-2 p-4 border rounded-lg">
        <h3 className="text-lg font-medium">Wallet Status</h3>
        <p className="text-sm text-gray-500">Not connected. Please connect your wallet to use Sui features.</p>
        <Button variant="outline" className="mt-2 bg-transparent" disabled>
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Wallet Status</h3>
      <div className="flex items-center gap-2 text-sm">
        <Wallet className="h-4 w-4" />
        <span className="font-medium">Connected:</span>
        <span className="text-gray-500">
          {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
        </span>
      </div>
      <Button variant="outline" className="mt-2 bg-transparent" onClick={() => disconnect()}>
        Disconnect
      </Button>
    </div>
  )
}
