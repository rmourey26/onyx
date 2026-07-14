-- Add job_title and linkedin_url columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
