import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShipmentTrackingView } from "@/components/shipping/shipment-tracking-view"

interface Props {
  params: Promise<{ id: string }>
}

export default async function TrackShipmentPage({ params }: Props) {
  const resolvedParams = await params
  const supabase = await createServerSupabaseClient()

  // Get the shipment by public_id
  const { data: shipment, error } = await supabase
    .from("shipping")
    .select("*")
    .eq("public_id", resolvedParams.id)
    .single()

  if (error || !shipment) {
    console.error("Error fetching shipment:", error)
    redirect("/shipping")
  }

  return (
    <div className="container mx-auto py-6">
      <ShipmentTrackingView shipment={shipment} />
    </div>
  )
}
