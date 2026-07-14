-- Add new OpenAI AI models to the AI Business Suite
-- GPT-5, GPT-5 mini, GPT-4.1, GPT-4.1 mini, and GPT-4.1 nano

BEGIN;

-- Insert the new OpenAI models
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'GPT-5',
    'openai',
    'gpt-5',
    'OpenAI''s most advanced flagship model with enhanced reasoning, multimodal capabilities, and improved performance across all domains',
    '["text", "vision", "reasoning", "coding", "analysis", "multimodal"]',
    '{"temperature": 0.7, "max_tokens": 8192}',
    0.020,
    true,
    'chat'
  ),
  (
    'GPT-5 Mini',
    'openai',
    'gpt-5-mini',
    'OpenAI''s efficient GPT-5 variant optimized for speed and cost-effectiveness while maintaining high performance',
    '["text", "reasoning", "coding", "analysis"]',
    '{"temperature": 0.7, "max_tokens": 4096}',
    0.005,
    true,
    'chat'
  ),
  (
    'GPT-4.1',
    'openai',
    'gpt-4.1',
    'Enhanced GPT-4 model with improved reasoning capabilities, better instruction following, and reduced hallucinations',
    '["text", "vision", "reasoning", "coding", "analysis"]',
    '{"temperature": 0.7, "max_tokens": 8192}',
    0.015,
    true,
    'chat'
  ),
  (
    'GPT-4.1 Mini',
    'openai',
    'gpt-4.1-mini',
    'Compact version of GPT-4.1 optimized for faster responses and lower costs while maintaining core capabilities',
    '["text", "reasoning", "coding"]',
    '{"temperature": 0.7, "max_tokens": 4096}',
    0.003,
    true,
    'chat'
  ),
  (
    'GPT-4.1 Nano',
    'openai',
    'gpt-4.1-nano',
    'Ultra-lightweight GPT-4.1 variant designed for high-throughput applications and edge deployment scenarios',
    '["text", "reasoning"]',
    '{"temperature": 0.7, "max_tokens": 2048}',
    0.001,
    true,
    'chat'
  );

COMMIT;
