-- Create sui_nfts table
CREATE TABLE IF NOT EXISTS public.sui_nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.business_cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  content_url TEXT NOT NULL,
  blockchain TEXT NOT NULL DEFAULT 'sui',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_card FOREIGN KEY (card_id) REFERENCES public.business_cards(id)
);

-- Set up Row Level Security for sui_nfts
ALTER TABLE public.sui_nfts ENABLE ROW LEVEL SECURITY;

-- Create policies for sui_nfts
CREATE POLICY "Users can view their own Sui NFTs"
  ON public.sui_nfts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Sui NFTs"
  ON public.sui_nfts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS sui_nfts_user_id_idx ON public.sui_nfts(user_id);
CREATE INDEX IF NOT EXISTS sui_nfts_card_id_idx ON public.sui_nfts(card_id);
