-- Check if public_id column exists in profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'public_id'
    ) THEN
        -- Add public_id column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN public_id UUID;
    END IF;

    -- Add public_access column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'public_access'
    ) THEN
        ALTER TABLE profiles ADD COLUMN public_access BOOLEAN DEFAULT true;
    END IF;

    -- Create index on public_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'profiles'
        AND indexname = 'profiles_public_id_idx'
    ) THEN
        CREATE INDEX profiles_public_id_idx ON profiles(public_id);
    END IF;
END $$;

-- Insert the specific public_id if it doesn't exist
DO $$
DECLARE
    target_public_id UUID := 'cddcb673-2728-4a63-961f-3503804a9e78';
    user_exists BOOLEAN;
BEGIN
    -- Check if any profile has this public_id
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE public_id = target_public_id
    ) INTO user_exists;

    -- If no profile has this public_id, find a user to assign it to
    IF NOT user_exists THEN
        -- Find a user without a public_id
        UPDATE profiles
        SET public_id = target_public_id,
            public_access = true,
            updated_at = NOW()
        WHERE public_id IS NULL
        LIMIT 1;
        
        -- If no update was made (all users have public_ids), update the first user
        IF NOT FOUND THEN
            UPDATE profiles
            SET public_id = target_public_id,
                public_access = true,
                updated_at = NOW()
            WHERE id = (SELECT id FROM profiles LIMIT 1);
        END IF;
    END IF;
END $$;
