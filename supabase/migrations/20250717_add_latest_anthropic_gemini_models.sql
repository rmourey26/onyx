-- Add latest Anthropic, Google, and OpenAI AI models (2025)
-- This migration adds the newest Claude 4.5, Gemini 3.0, and GPT-5 models
-- All existing models are retained

BEGIN;

-- Add GPT-5 from OpenAI (released August 2025)
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'GPT-5',
  'openai',
  'gpt-5',
  'OpenAI''s most advanced model with breakthrough reasoning, 400K context window, and 128K output tokens',
  '["text", "vision", "reasoning", "coding", "analysis", "creative_writing", "long_context"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 128000}'::jsonb,
  0.00125,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'gpt-5'
);

-- Add Claude 4.5 Sonnet
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Claude Sonnet 4.5',
  'anthropic',
  'claude-sonnet-4-5',
  'Claude 4.5 Sonnet for daily use, scaled production, and complex tasks with enhanced reasoning',
  '["text", "vision", "reasoning", "coding", "analysis", "long_context", "production"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 16384}'::jsonb,
  0.0045,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'claude-sonnet-4-5'
);

-- Add Claude 4.5 Haiku
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Claude Haiku 4.5',
  'anthropic',
  'claude-haiku-4-5',
  'Claude 4.5 Haiku with near-frontier performance, optimized for real-time, low-latency tasks',
  '["text", "reasoning", "coding", "analysis", "low_latency", "speed"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 8192}'::jsonb,
  0.002,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'claude-haiku-4-5'
);

-- Add Claude 4.5 Opus
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Claude Opus 4.5',
  'anthropic',
  'claude-opus-4-5-20251101',
  'State-of-the-art Claude 4.5 Opus for advanced coding, agents, and computer use',
  '["text", "vision", "reasoning", "coding", "analysis", "long_context", "agents", "computer_use", "state_of_art"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 32768}'::jsonb,
  0.008,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'claude-opus-4-5-20251101'
);

-- Add Claude 3.5 Sonnet v2
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Claude 3.5 Sonnet v2',
  'anthropic',
  'claude-3-5-sonnet-20241022',
  'Latest Claude 3.5 Sonnet with enhanced coding, reasoning, and vision capabilities',
  '["text", "vision", "reasoning", "coding", "analysis", "long_context"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 8192}'::jsonb,
  0.003,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'claude-3-5-sonnet-20241022'
);

-- Add Claude 3.7 Sonnet
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Claude 3.7 Sonnet',
  'anthropic',
  'claude-3-7-sonnet-20250219',
  'Anthropic''s most advanced Claude 3 model with hybrid reasoning and breakthrough performance',
  '["text", "vision", "reasoning", "coding", "analysis", "long_context", "hybrid_reasoning"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 16384}'::jsonb,
  0.004,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'claude-3-7-sonnet-20250219'
);

-- Add Claude Code
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Claude Code',
  'anthropic',
  'claude-code-20250201',
  'Specialized Claude model optimized for code generation, debugging, and software engineering',
  '["coding", "text", "reasoning", "analysis", "execution"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 8192}'::jsonb,
  0.0035,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'claude-code-20250201'
);

-- Add Gemini 2.0 Flash Thinking Experimental
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Gemini 2.0 Flash Thinking Experimental',
  'google',
  'gemini-2.0-flash-thinking-exp-01-21',
  'Experimental Gemini 2.0 with advanced reasoning, supports 1M input tokens and 64K output tokens',
  '["text", "vision", "reasoning", "coding", "analysis", "long_context", "thinking"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 64000}'::jsonb,
  0.001,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'gemini-2.0-flash-thinking-exp-01-21'
);

-- Add Gemini 2.0 Flash Experimental
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Gemini 2.0 Flash Experimental',
  'google',
  'gemini-2.0-flash-exp',
  'Latest experimental Gemini 2.0 Flash with multimodal capabilities and enhanced speed',
  '["text", "vision", "reasoning", "coding", "multimodal"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 8192}'::jsonb,
  0.0008,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'gemini-2.0-flash-exp'
);

-- Add Gemini 3 Pro
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Gemini 3 Pro',
  'google',
  'gemini-3-pro-20251115',
  'Google''s flagship model topping LMArena Leaderboard with advanced multimodal reasoning, 1M-2M token context',
  '["text", "vision", "reasoning", "coding", "analysis", "long_context", "multimodal", "advanced_reasoning", "agentic"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 32768}'::jsonb,
  0.005,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'gemini-3-pro-20251115'
);

-- Add Gemini 3 Pro Image Preview
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Gemini 3 Pro Image Preview',
  'google',
  'gemini-3-pro-image-preview',
  'Specialized Gemini 3 variant with enhanced image understanding and generation capabilities',
  '["text", "vision", "image_generation", "analysis", "multimodal"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 8192}'::jsonb,
  0.006,
  true,
  'vision',
  'vision'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'gemini-3-pro-image-preview'
);

-- Add Gemini 2.0 Flash (production-ready)
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type, model_type)
SELECT
  'Gemini 2.0 Flash',
  'google',
  'gemini-2.0-flash-20250114',
  'Production-ready Gemini 2.0 Flash with optimized performance and stability',
  '["text", "vision", "reasoning", "coding", "multimodal"]'::jsonb,
  '{"temperature": 0.7, "max_tokens": 8192}'::jsonb,
  0.0008,
  true,
  'chat',
  'chat'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE model_id = 'gemini-2.0-flash-20250114'
);

-- Update comment to reflect Gemini 3 Pro as the most capable production-ready model
COMMENT ON TABLE ai_models IS 'AI models catalog. Recommended defaults: Gemini 3 Pro (gemini-3-pro-20251115) for general use, Claude Opus 4.5 (claude-opus-4-5-20251101) for coding/agents. Gemini 3 Pro tops LMArena Leaderboard as of Nov 2025.';

COMMIT;
