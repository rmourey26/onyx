-- Add latest AI models from Vercel AI Gateway (2025)
-- This migration adds new models while retaining all existing models
-- Models added: Claude 4 series, Gemini 2.x series, Grok 4, and additional variants

BEGIN;

-- Add new Anthropic Claude 4 series models
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'Claude Sonnet 4',
    'anthropic',
    'claude-sonnet-4',
    'Anthropic''s latest Claude 4 model with enhanced reasoning, coding, and analysis capabilities',
    '["text", "vision", "reasoning", "coding", "analysis", "long_context"]',
    '{"temperature": 0.7, "max_tokens": 8192}',
    0.003,
    true,
    'chat'
  ),
  (
    'Claude Sonnet 4.5',
    'anthropic',
    'claude-sonnet-4.5',
    'Advanced Claude 4.5 model with improved performance and extended context window',
    '["text", "vision", "reasoning", "coding", "analysis", "long_context"]',
    '{"temperature": 0.7, "max_tokens": 16384}',
    0.004,
    true,
    'chat'
  ),
  (
    'Claude Haiku 4.5',
    'anthropic',
    'claude-haiku-4.5',
    'Fast and efficient Claude 4.5 variant optimized for speed and cost-effectiveness',
    '["text", "reasoning", "coding"]',
    '{"temperature": 0.7, "max_tokens": 4096}',
    0.0003,
    true,
    'chat'
  );

-- Add new Google Gemini 2.x series models
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'Gemini 2.0 Flash',
    'google',
    'gemini-2.0-flash',
    'Google''s next-generation Gemini model with improved speed and multimodal capabilities',
    '["text", "vision", "reasoning", "coding", "multimodal"]',
    '{"temperature": 0.7, "max_tokens": 8192}',
    0.0008,
    true,
    'chat'
  ),
  (
    'Gemini 2.5 Flash',
    'google',
    'gemini-2.5-flash',
    'Latest Gemini Flash model with enhanced performance and efficiency',
    '["text", "vision", "reasoning", "coding", "multimodal"]',
    '{"temperature": 0.7, "max_tokens": 8192}',
    0.0009,
    true,
    'chat'
  ),
  (
    'Gemini 2.5 Pro',
    'google',
    'gemini-2.5-pro',
    'Google''s most advanced Gemini model with superior reasoning and long context support',
    '["text", "vision", "reasoning", "coding", "analysis", "long_context", "multimodal"]',
    '{"temperature": 0.7, "max_tokens": 32768}',
    0.004,
    true,
    'chat'
  ),
  (
    'Gemini 2.5 Flash Lite',
    'google',
    'gemini-2.5-flash-lite',
    'Ultra-lightweight Gemini variant for high-throughput and edge applications',
    '["text", "reasoning"]',
    '{"temperature": 0.7, "max_tokens": 4096}',
    0.0004,
    true,
    'chat'
  );

-- Add xAI Grok models
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'Grok 4',
    'xai',
    'grok-4',
    'xAI''s advanced Grok model with real-time knowledge and enhanced reasoning capabilities',
    '["text", "reasoning", "coding", "analysis", "real_time"]',
    '{"temperature": 0.7, "max_tokens": 8192}',
    0.005,
    true,
    'chat'
  ),
  (
    'Grok 4 Fast',
    'xai',
    'grok-4-fast',
    'Optimized Grok variant for faster responses while maintaining high quality',
    '["text", "reasoning", "coding"]',
    '{"temperature": 0.7, "max_tokens": 4096}',
    0.002,
    true,
    'chat'
  );

-- Add OpenAI GPT-5 Nano (ultra-efficient variant)
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'GPT-5 Nano',
    'openai',
    'gpt-5-nano',
    'Ultra-efficient GPT-5 variant designed for edge deployment and high-throughput scenarios',
    '["text", "reasoning"]',
    '{"temperature": 0.7, "max_tokens": 2048}',
    0.0005,
    true,
    'chat'
  );

-- Add additional embedding models for enhanced RAG capabilities
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'OpenAI Embedding 3 Large',
    'openai',
    'text-embedding-3-large',
    'OpenAI''s high-performance embedding model with larger dimensions for improved accuracy',
    '["embedding"]',
    '{"dimensions": 3072}',
    0.00013,
    true,
    'embedding'
  ),
  (
    'Cohere Embed v3',
    'cohere',
    'embed-english-v3.0',
    'Cohere''s latest embedding model optimized for English text with superior semantic understanding',
    '["embedding"]',
    '{"dimensions": 1024}',
    0.0001,
    true,
    'embedding'
  );

-- Add vision-specific models
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'GPT-4 Vision',
    'openai',
    'gpt-4-vision-preview',
    'OpenAI''s specialized vision model for advanced image understanding and analysis',
    '["vision", "text", "reasoning", "analysis"]',
    '{"temperature": 0.7, "max_tokens": 4096}',
    0.01,
    true,
    'vision'
  ),
  (
    'Claude 3.5 Sonnet',
    'anthropic',
    'claude-3-5-sonnet-20240620',
    'Enhanced Claude 3.5 model with improved vision and coding capabilities',
    '["text", "vision", "reasoning", "coding", "analysis"]',
    '{"temperature": 0.7, "max_tokens": 8192}',
    0.003,
    true,
    'chat'
  );

-- Add specialized coding models
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'GPT-4 Code Interpreter',
    'openai',
    'gpt-4-code-interpreter',
    'Specialized GPT-4 variant with enhanced code execution and debugging capabilities',
    '["coding", "text", "reasoning", "execution"]',
    '{"temperature": 0.7, "max_tokens": 8192}',
    0.012,
    true,
    'chat'
  );

COMMIT;
