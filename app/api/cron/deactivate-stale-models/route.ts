import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Protect with the same CRON_SECRET Vercel injects automatically
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createServerSupabaseClient()

  try {
    // Mark models inactive if updated_at is older than 90 days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)

    const { data, error } = await supabase
      .from("ai_models")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("is_active", true)
      .lt("updated_at", cutoff.toISOString())
      .select("model_id, name, provider")

    if (error) {
      console.error("[cron/deactivate-stale-models]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      deactivated: data?.length ?? 0,
      models: data?.map(m => `${m.provider}/${m.model_id}`),
      cutoff: cutoff.toISOString(),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[cron/deactivate-stale-models]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
