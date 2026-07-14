CREATE OR REPLACE FUNCTION update_ai_model_type()
RETURNS VOID AS $$
BEGIN
  -- Update existing AI models to categorize them into specific types.
  UPDATE ai_models
  SET type = CASE
    WHEN (provider = 'openai' AND name LIKE '%gpt%') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'openai' AND name LIKE '%davinci%') THEN 'TEXT_COMPLETION'
    WHEN (provider = 'openai' AND name LIKE '%ada%') THEN 'TEXT_COMPLETION'
    WHEN (provider = 'openai' AND name LIKE '%babbage%') THEN 'TEXT_COMPLETION'
    WHEN (provider = 'openai' AND name LIKE '%curie%') THEN 'TEXT_COMPLETION'
    WHEN (provider = 'openai' AND name = 'text-embedding-ada-002') THEN 'EMBEDDING'
    WHEN (provider = 'openai' AND name LIKE '%whisper%') THEN 'TRANSCRIPTION'
    WHEN (provider = 'stability-ai' AND name = 'stable-diffusion-xl-1024-v1-0') THEN 'IMAGE_GENERATION'
    WHEN (provider = 'stability-ai' AND name = 'esrgan-v1-x2plus') THEN 'IMAGE_UPSCALING'
    WHEN (provider = 'cohere' AND name = 'embed-multilingual-v3.0') THEN 'EMBEDDING'
    WHEN (provider = 'cohere' AND name = 'embed-english-v3.0') THEN 'EMBEDDING'
    WHEN (provider = 'cohere' AND name = 'command-r-plus') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'cohere' AND name = 'command-r') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'cohere' AND name = 'command') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'cohere' AND name = 'command-light') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'cohere' AND name = 'summarize-xlarge') THEN 'SUMMARIZATION'
    WHEN (provider = 'cohere' AND name = 'summarize-large') THEN 'SUMMARIZATION'
    WHEN (provider = 'cohere' AND name = 'rerank-multilingual-v2.0') THEN 'RERANKING'
    WHEN (provider = 'cohere' AND name = 'rerank-english-v2.0') THEN 'RERANKING'
    WHEN (provider = 'cohere' AND name = 'rerank-english-v3.0') THEN 'RERANKING'
    WHEN (provider = 'google-ai' AND name = 'models/embedding-gecko-001') THEN 'EMBEDDING'
    WHEN (provider = 'google-ai' AND name = 'models/textembedding-gecko-multilingual') THEN 'EMBEDDING'
    WHEN (provider = 'google-ai' AND name = 'gemini-1.5-pro-001') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'google-ai' AND name = 'gemini-1.0-pro') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'google-ai' AND name = 'gemini-1.0-ultra') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'mistral-ai' AND name = 'Mistral-medium') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'mistral-ai' AND name = 'Mistral-small') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'mistral-ai' AND name = 'Mistral-large-latest') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'mistral-ai' AND name = 'open-mistral-7b') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'meta' AND name = 'Llama-2-70b-chat-hf') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'meta' AND name = 'Llama-3-70B-Instruct') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'meta' AND name = 'Llama-3-8B-Instruct') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'anthropic' AND name = 'claude-3-opus-20240229') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'anthropic' AND name = 'claude-3-sonnet-20240229') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'anthropic' AND name = 'claude-3-haiku-20240307') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'ai21' AND name = 'j2-ultra') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'ai21' AND name = 'j2-grande') THEN 'CHAT_COMPLETION'
    WHEN (provider = 'amazon' AND name = 'titan-embed-text-v1') THEN 'EMBEDDING'
    WHEN (provider = 'amazon' AND name = 'titan-text-express-v1') THEN 'CHAT_COMPLETION'
    ELSE 'OTHER'
  END;

  -- Seed initial AI models if they don't exist.
  INSERT INTO ai_models (name, provider, type, active) VALUES
  ('gpt-4', 'openai', 'CHAT_COMPLETION', TRUE),
  ('gpt-4-turbo-preview', 'openai', 'CHAT_COMPLETION', TRUE),
  ('gpt-4-1106-preview', 'openai', 'CHAT_COMPLETION', TRUE),
  ('gpt-3.5-turbo', 'openai', 'CHAT_COMPLETION', TRUE),
  ('gpt-3.5-turbo-16k', 'openai', 'CHAT_COMPLETION', TRUE),
  ('text-embedding-ada-002', 'openai', 'EMBEDDING', TRUE),
  ('stable-diffusion-xl-1024-v1-0', 'stability-ai', 'IMAGE_GENERATION', TRUE),
  ('esrgan-v1-x2plus', 'stability-ai', 'IMAGE_UPSCALING', TRUE),
  ('embed-multilingual-v3.0', 'cohere', 'EMBEDDING', TRUE),
  ('embed-english-v3.0', 'cohere', 'EMBEDDING', TRUE),
  ('command-r-plus', 'cohere', 'CHAT_COMPLETION', TRUE),
  ('command-r', 'cohere', 'CHAT_COMPLETION', TRUE),
  ('command', 'cohere', 'CHAT_COMPLETION', TRUE),
  ('command-light', 'cohere', 'CHAT_COMPLETION', TRUE),
  ('summarize-xlarge', 'cohere', 'SUMMARIZATION', TRUE),
  ('summarize-large', 'cohere', 'SUMMARIZATION', TRUE),
  ('rerank-multilingual-v2.0', 'cohere', 'RERANKING', TRUE),
  ('rerank-english-v2.0', 'cohere', 'RERANKING', TRUE),
  ('rerank-english-v3.0', 'cohere', 'RERANKING', TRUE),
  ('models/embedding-gecko-001', 'google-ai', 'EMBEDDING', TRUE),
  ('models/textembedding-gecko-multilingual', 'google-ai', 'EMBEDDING', TRUE),
  ('gemini-1.5-pro-001', 'google-ai', 'CHAT_COMPLETION', TRUE),
  ('gemini-1.0-pro', 'google-ai', 'CHAT_COMPLETION', TRUE),
  ('gemini-1.0-ultra', 'google-ai', 'CHAT_COMPLETION', TRUE),
  ('Mistral-medium', 'mistral-ai', 'CHAT_COMPLETION', TRUE),
  ('Mistral-small', 'mistral-ai', 'CHAT_COMPLETION', TRUE),
  ('Mistral-large-latest', 'mistral-ai', 'CHAT_COMPLETION', TRUE),
  ('open-mistral-7b', 'mistral-ai', 'CHAT_COMPLETION', TRUE),
  ('Llama-2-70b-chat-hf', 'meta', 'CHAT_COMPLETION', TRUE),
  ('Llama-3-70B-Instruct', 'meta', 'CHAT_COMPLETION', TRUE),
  ('Llama-3-8B-Instruct', 'meta', 'CHAT_COMPLETION', TRUE),
  ('claude-3-opus-20240229', 'anthropic', 'CHAT_COMPLETION', TRUE),
  ('claude-3-sonnet-20240229', 'anthropic', 'CHAT_COMPLETION', TRUE),
  ('claude-3-haiku-20240307', 'anthropic', 'CHAT_COMPLETION', TRUE),
  ('j2-ultra', 'ai21', 'CHAT_COMPLETION', TRUE),
  ('j2-grande', 'ai21', 'CHAT_COMPLETION', TRUE),
  ('titan-embed-text-v1', 'amazon', 'EMBEDDING', TRUE),
  ('titan-text-express-v1', 'amazon', 'CHAT_COMPLETION', TRUE)
  ON CONFLICT (name, provider) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update and seed AI models.
SELECT update_ai_model_type();

-- Drop the function after execution.
DROP FUNCTION update_ai_model_type();
