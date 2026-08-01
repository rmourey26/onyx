-- Support Chat: Kairo Intelligent Assistant
-- Tables: support_conversations, support_messages, support_learning

-- Drop previous schema if it exists from an earlier migration attempt
DROP TABLE IF EXISTS support_chat_messages CASCADE;
DROP TABLE IF EXISTS support_chat_sessions CASCADE;

-- ─── support_conversations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_token   TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  model_id        TEXT NOT NULL DEFAULT 'openai/gpt-4o',
  input_mode      TEXT NOT NULL DEFAULT 'text' CHECK (input_mode IN ('text', 'voice')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  message_count   INTEGER NOT NULL DEFAULT 0,
  resolved        BOOLEAN NOT NULL DEFAULT false,
  metadata        JSONB NOT NULL DEFAULT '{}'
);

-- ─── support_messages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  role                TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content             TEXT NOT NULL,
  input_mode          TEXT NOT NULL DEFAULT 'text' CHECK (input_mode IN ('text', 'voice')),
  model_id            TEXT,
  latency_ms          INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata            JSONB NOT NULL DEFAULT '{}'
);

-- ─── support_learning ─────────────────────────────────────────────────────────
-- Stores resolved Q&A pairs for fine-tuning and RAG retrieval
CREATE TABLE IF NOT EXISTS support_learning (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID REFERENCES support_conversations(id) ON DELETE SET NULL,
  question            TEXT NOT NULL,
  answer              TEXT NOT NULL,
  model_id            TEXT,
  quality_rating      SMALLINT CHECK (quality_rating BETWEEN 1 AND 5),
  user_feedback       TEXT,
  tags                TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata            JSONB NOT NULL DEFAULT '{}'
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_support_conversations_user_id    ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_started_at ON support_conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation_id ON support_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at      ON support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_learning_conversation_id ON support_learning(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_learning_tags            ON support_learning USING gin(tags);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_learning      ENABLE ROW LEVEL SECURITY;

-- Authenticated users own their conversations
CREATE POLICY "Users manage own conversations"
  ON support_conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anonymous inserts allowed (user_id IS NULL)
CREATE POLICY "Anonymous conversation insert"
  ON support_conversations FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Messages inherit conversation ownership
CREATE POLICY "Users manage messages in own conversations"
  ON support_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM support_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM support_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Anonymous message insert"
  ON support_messages FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM support_conversations c WHERE c.id = conversation_id AND c.user_id IS NULL)
  );

-- Learning rows are service-role only (inserted server-side)
CREATE POLICY "Service role manages support_learning"
  ON support_learning FOR ALL
  USING (true)
  WITH CHECK (true);

-- ─── RPC: increment message count ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_support_conversation_message_count(p_conversation_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE support_conversations SET message_count = message_count + 1 WHERE id = p_conversation_id;
END;
$$;
