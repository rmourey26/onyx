import { useContext } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Bitcoin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MainNav } from "@/components/main-nav"
import { AppContext } from "@/app/index"

export function SiteHeader() {
  const { bitcoinAddress, connectBitcoin } = useContext(AppContext)

  return (
    <header className="bg-background sticky top-0 z-40 w-full">
      <div className="container px-4 pr-8 flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className={cn(
                      "mx-2 bg-white hover:bg-white rounded-xl shadow-rainbowkit hover:scale-1025 transition-all active:scale-95"
                    )}
                    onClick={() => connectBitcoin()}
                  >
                    <div
                      className={cn(
                        "rounded-full p-0.5",
                        bitcoinAddress ? "bg-bitcoin" : "bg-gray-500"
                      )}
                    >
                      <Bitcoin className="w-5 h-5" color="white" />
                    </div>
                  </Button>
                </TooltipTrigger>
                {bitcoinAddress && (
                  <TooltipContent>
                    <p className="text-xs">{bitcoinAddress}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <ConnectButton
              chainStatus="icon"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
              showBalance={false}
            />
          </nav>
        </div>
      </div>
    </header>
  )
}