-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT,
  username TEXT,
  email TEXT,
  company TEXT,
  website TEXT,
  avatar_url TEXT,
  waddress TEXT,
  xhandle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create business_cards table with updated schema
CREATE TABLE IF NOT EXISTS public.business_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  businesscard_name TEXT,
  company_name TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  style JSONB,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Set up Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Set up Row Level Security for business_cards
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for business_cards
CREATE POLICY "Users can view their own business cards"
  ON public.business_cards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business cards"
  ON public.business_cards
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business cards"
  ON public.business_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS business_cards_user_id_idx ON public.business_cards(user_id);
