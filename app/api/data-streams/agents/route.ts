import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const newUrl = url.toString().replace("/api/data-streams/", "/api/v1/data-streams/")

  return NextResponse.redirect(newUrl, 301)
}

// The original code is now deprecated and redirected to the v1 API
// /**
//  * Fetches AI analysis results for the authenticated user.
//  * @param request - The NextRequest object containing the request details.
//  * @returns A JSON response containing the AI analysis results or an error message.
//  */
// export async function GET(request: NextRequest) {
//   try {
//     const supabase = await createServerSupabaseClient()

//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser()
//     if (authError || !user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { data: results, error } = await supabase
//       .from("ai_analysis_results")
//       .select(`
//         id,
//         created_at,
//         analysis_type,
//         results,
//         ai_agents!inner(name)
//       `)
//       .eq("user_id", user.id)
//       .order("created_at", { ascending: false })
//       .limit(50)

//     if (error) {
//       console.error("Error fetching agent streams:", error)
//       return NextResponse.json({ error: error.message }, { status: 500 })
//     }

//     const streams =
//       results?.map((result: any) => ({
//         id: result.id,
//         name: `${result.ai_agents.name} - ${result.analysis_type}`,
//         type: "agent",
//         status: "completed",
//         created_at: result.created_at,
//         results: result.results,
//         has_output: !!result.results,
//       })) || []

//     return NextResponse.json(streams)
//   } catch (error) {
//     console.error("Error in agent streams API:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
