import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        <WifiOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">You're offline</h1>
        <p className="mb-6 text-gray-500">Please check your internet connection and try again.</p>
        <Button asChild>
          <Link href="/">Try Again</Link>
        </Button>
      </div>
    </div>
  )
}
