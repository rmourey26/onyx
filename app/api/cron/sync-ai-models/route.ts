import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// Curated model manifest — updated July 2026
// Upserted by model_id; is_active toggled based on presence in manifest.
// ---------------------------------------------------------------------------
const MODEL_MANIFEST = [
  // OpenAI
  { model_id: "gpt-5.6-sol",    name: "GPT-5.6 Sol",       provider: "OpenAI",    type: "chat", context_window: 256000, description: "Frontier model — OpenAI Sol tier", capabilities: { streaming: true, function_calling: true, vision: true },  input_price_per_1m: 30,  output_price_per_1m: 90  },
  { model_id: "gpt-5.6-terra",  name: "GPT-5.6 Terra",     provider: "OpenAI",    type: "chat", context_window: 128000, description: "Balanced model — OpenAI Terra tier", capabilities: { streaming: true, function_calling: true, vision: true },  input_price_per_1m: 10,  output_price_per_1m: 30  },
  { model_id: "gpt-5.6-luna",   name: "GPT-5.6 Luna",      provider: "OpenAI",    type: "chat", context_window: 128000, description: "Cost-efficient — OpenAI Luna tier", capabilities: { streaming: true, function_calling: true, vision: false }, input_price_per_1m: 2,   output_price_per_1m: 8   },
  { model_id: "gpt-5",          name: "GPT-5",              provider: "OpenAI",    type: "chat", context_window: 128000, description: "OpenAI flagship model", capabilities: { streaming: true, function_calling: true, vision: true },  input_price_per_1m: 15,  output_price_per_1m: 60  },
  { model_id: "gpt-5-mini",     name: "GPT-5 Mini",         provider: "OpenAI",    type: "chat", context_window: 128000, description: "Efficient variant of GPT-5", capabilities: { streaming: true, function_calling: true, vision: false }, input_price_per_1m: 0.15, output_price_per_1m: 0.6 },
  { model_id: "gpt-4.1",        name: "GPT-4.1",            provider: "OpenAI",    type: "chat", context_window: 128000, description: "Legacy GPT-4 flagship", capabilities: { streaming: true, function_calling: true, vision: true },  input_price_per_1m: 10,  output_price_per_1m: 30  },
  { model_id: "o3",             name: "o3 Reasoning",       provider: "OpenAI",    type: "chat", context_window: 200000, description: "Advanced reasoning model", capabilities: { streaming: true, function_calling: true, vision: false }, input_price_per_1m: 10,  output_price_per_1m: 40  },
  { model_id: "o4-mini",        name: "o4 Mini Reasoning",  provider: "OpenAI",    type: "chat", context_window: 128000, description: "Fast reasoning model", capabilities: { streaming: true, function_calling: true, vision: false }, input_price_per_1m: 1.5, output_price_per_1m: 6   },
  // Anthropic
  { model_id: "claude-fable-5", name: "Claude Fable 5",     provider: "Anthropic", type: "chat", context_window: 200000, description: "Anthropic frontier model", capabilities: { streaming: true, function_calling: true, vision: true },  input_price_per_1m: 25,  output_price_per_1m: 75  },
  { model_id: "claude-sonnet-5",name: "Claude Sonnet 5",    provider: "Anthropic", type: "chat", context_window: 200000, description: "Balanced Anthropic model", capabilities: { streaming: true, function_calling: true, vision: true },  input_price_per_1m: 10,  output_price_per_1m: 30  },
  { model_id: "claude-opus-4",  name: "Claude Opus 4",      provider: "Anthropic", type: "chat", context_window: 200000, description: "Legacy Anthropic flagship", capabilities: { streaming: true, function_calling: true, vision: true },  input_price_per_1m: 15,  output_price_per_1m: 75  },
  { model_id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "Anthropic", type: "chat", context_window: 200000, description: "Legacy balanced Anthropic model", capabilities: { streaming: true, function_calling: true, vision: true }, input_price_per_1m: 3, output_price_per_1m: 15 },
  { model_id: "claude-haiku-3-5",  name: "Claude Haiku 3.5",  provider: "Anthropic", type: "chat", context_window: 200000, description: "Fast and cost-efficient", capabilities: { streaming: true, function_calling: true, vision: false }, input_price_per_1m: 0.25, output_price_per_1m: 1.25 },
  // Google
  { model_id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", provider: "Google",   type: "chat", context_window: 1000000, description: "Google balanced model", capabilities: { streaming: true, function_calling: true, vision: true }, input_price_per_1m: 1,   output_price_per_1m: 4   },
  { model_id: "gemini-2.5-pro",   name: "Gemini 2.5 Pro",   provider: "Google",   type: "chat", context_window: 1000000, description: "Legacy Google flagship", capabilities: { streaming: true, function_calling: true, vision: true }, input_price_per_1m: 3.5, output_price_per_1m: 10.5 },
  { model_id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google",   type: "chat", context_window: 1000000, description: "Legacy fast Google model", capabilities: { streaming: true, function_calling: true, vision: true }, input_price_per_1m: 0.075, output_price_per_1m: 0.3 },
  // xAI
  { model_id: "grok-4.5",  name: "Grok 4.5",  provider: "xAI", type: "chat", context_window: 131072, description: "xAI balanced model", capabilities: { streaming: true, function_calling: true, vision: true }, input_price_per_1m: 5, output_price_per_1m: 15 },
  { model_id: "grok-4.3",  name: "Grok 4.3",  provider: "xAI", type: "chat", context_window: 131072, description: "xAI reasoning model", capabilities: { streaming: true, function_calling: true, vision: false }, input_price_per_1m: 3, output_price_per_1m: 9 },
] as const

export async function GET(request: Request) {
  // Verify cron authorization
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createServerSupabaseClient()
  const manifestIds = MODEL_MANIFEST.map(m => m.model_id)

  let upserted = 0
  let deactivated = 0
  const errors: string[] = []

  try {
    // Upsert all models in manifest
    for (const model of MODEL_MANIFEST) {
      const { error } = await supabase
        .from("ai_models")
        .upsert(
          {
            model_id:    model.model_id,
            name:        model.name,
            provider:    model.provider,
            type:        model.type,
            is_active:   true,
            context_window:       (model as any).context_window ?? null,
            description:          model.description,
            capabilities:         (model as any).capabilities ? JSON.stringify((model as any).capabilities) : null,
            input_price_per_1m:   (model as any).input_price_per_1m ?? null,
            output_price_per_1m:  (model as any).output_price_per_1m ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "model_id", ignoreDuplicates: false },
        )
      if (error) {
        errors.push(`${model.model_id}: ${error.message}`)
      } else {
        upserted++
      }
    }

    // Deactivate models not in manifest
    const { data: deactivatedRows, error: deactivateError } = await supabase
      .from("ai_models")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .not("model_id", "in", `(${manifestIds.map(id => `"${id}"`).join(",")})`)
      .eq("is_active", true)
      .select("model_id")

    if (deactivateError) {
      errors.push(`deactivate: ${deactivateError.message}`)
    } else {
      deactivated = deactivatedRows?.length ?? 0
    }

    return NextResponse.json({
      ok: true,
      upserted,
      deactivated,
      errors: errors.length ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[cron/sync-ai-models]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
