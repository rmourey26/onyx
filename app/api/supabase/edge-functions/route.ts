import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - List available Edge Functions
export async function GET() {
  try {
    // This is a utility endpoint to list available functions
    // In a real implementation, you might want to maintain a registry
    // or fetch this information from Supabase
    const availableFunctions = [
      {
        name: "process-database-embeddings",
        description: "Process database embeddings for AI operations",
        methods: ["POST"],
        endpoint: "/api/supabase/functions/process-database-embeddings",
      },
      // Add more functions as you create them
    ]

    return NextResponse.json({
      success: true,
      functions: availableFunctions,
      usage: {
        description: "Use /api/supabase/functions/[function-name] to invoke specific Edge Functions",
        example: "POST /api/supabase/functions/process-database-embeddings",
      },
    })
  } catch (error) {
    console.error("Error listing Edge Functions:", error)
    return NextResponse.json({ error: "Failed to list Edge Functions" }, { status: 500 })
  }
}

// POST - Generic function invoker (alternative interface)
export async function POST(request: NextRequest) {
  try {
    const { functionName, payload, method = "POST" } = await request.json()

    if (!functionName) {
      return NextResponse.json({ error: "functionName is required" }, { status: 400 })
    }

    console.log(`Invoking Edge Function: ${functionName} via generic invoker`)

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (error) {
      console.error(`Error invoking function ${functionName}:`, error)
      return NextResponse.json({ error: error.message || "Function invocation failed" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      functionName,
      invokedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Generic function invoker error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
