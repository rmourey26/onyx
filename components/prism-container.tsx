"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import the 3D component with no SSR
const FeaturePrism = dynamic(() => import("@/components/feature-prism"), {
  ssr: false,
  loading: () => <LoadingFallback />,
})

function LoadingFallback() {
  return (
    <div className="w-full h-[70vh] md:h-[80vh] flex items-center justify-center bg-arctic-gradient">
      <div className="text-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-4 text-muted-foreground">Loading 3D visualization...</p>
      </div>
    </div>
  )
}

export default function PrismContainer() {
  return (
    <div className="w-full h-[70vh] md:h-[80vh]">
      <Suspense fallback={<LoadingFallback />}>
        <FeaturePrism />
      </Suspense>
    </div>
  )
}
