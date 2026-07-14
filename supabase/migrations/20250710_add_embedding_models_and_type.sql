BEGIN;

-- First, add a 'type' column to the ai_models table to distinguish
-- between model functionalities (e.g., 'chat', 'embedding').
-- We'll default existing models to 'chat' as they are likely for text generation.
ALTER TABLE public.ai_models
ADD COLUMN type TEXT NOT NULL DEFAULT 'chat';

-- Now, insert a selection of high-quality embedding models to enhance
-- the platform's AI and RAG capabilities.

-- Insert OpenAI's latest and most cost-effective embedding model.
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'OpenAI Embedding 3 Small',
    'openai',
    'text-embedding-3-small',
    'OpenAI''s newest, most performant, and cheapest embedding model. Supports configurable dimensions.',
    '["embedding"]', -- Corrected JSON array syntax
    '{"dimensions": 1536}',
    0.00002,
    true,
    'embedding'
  );

-- Insert a high-performance embedding model from Voyage AI for diversity.
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'Voyage Large 2',
    'voyage-ai',
    'voyage-large-2',
    'High-performance embedding model from Voyage AI, ideal for state-of-the-art RAG applications.',
    '["embedding"]', -- Corrected JSON array syntax
    '{"dimensions": 1024}',
    0.0001,
    true,
    'embedding'
  );

-- Insert Google's latest text embedding model.
INSERT INTO public.ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active, type)
VALUES
  (
    'Google Text Embedding 004',
    'google',
    'text-embedding-004',
    'Google''s latest text embedding model, optimized for performance and efficiency.',
    '["embedding"]', -- Corrected JSON array syntax
    '{"dimensions": 768}',
    0.000025, -- Note: Pricing is estimated and can vary.
    true,
    'embedding'
  );

-- After populating the new models and setting the default for existing ones,
-- it's good practice to remove the default constraint from the 'type' column.
ALTER TABLE public.ai_models
ALTER COLUMN type DROP DEFAULT;

COMMIT;
