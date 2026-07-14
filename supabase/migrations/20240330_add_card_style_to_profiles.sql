-- Add card_style column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS card_style JSONB DEFAULT '{"backgroundColor": "#ffffff", "textColor": "#333333", "primaryColor": "#3b82f6"}';

-- Update nfts table to reference profiles instead of business_cards
ALTER TABLE nfts
DROP COLUMN IF EXISTS card_id,
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id);

-- Update sui_nfts table to reference profiles instead of business_cards
ALTER TABLE sui_nfts
DROP COLUMN IF EXISTS card_id,
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id);
