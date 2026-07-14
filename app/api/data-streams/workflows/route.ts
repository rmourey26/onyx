import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const newUrl = url.toString().replace("/api/data-streams/", "/api/v1/data-streams/")

  return NextResponse.redirect(newUrl, 301)
}

// Original GET function logic can be preserved here if needed for reference or future use
// async function originalGET() {
//   try {
//     const supabase = await createServerSupabaseClient()

//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser()
//     if (authError || !user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { data: runs, error } = await supabase
//       .from("ai_workflow_runs")
//       .select(`
//         id,
//         created_at,
//         status,
//         results,
//         error,
//         ai_workflows!inner(name)
//       `)
//       .eq("user_id", user.id)
//       .order("created_at", { ascending: false })
//       .limit(50)

//     if (error) {
//       console.error("Error fetching workflow streams:", error)
//       return NextResponse.json({ error: error.message }, { status: 500 })
//     }

//     const streams =
//       runs?.map((run: any) => ({
//         id: run.id,
//         name: run.ai_workflows.name,
//         type: "workflow",
//         status: run.status || "completed",
//         created_at: run.created_at,
//         results: run.results,
//         has_output: !!run.results && !run.error,
//       })) || []

//     return NextResponse.json(streams)
//   } catch (error) {
//     console.error("Error in workflow streams API:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
