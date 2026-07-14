import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-2">Business Card Not Found</h2>
      <p className="mb-4">We couldn't find the business card you're looking for.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  )
}
