'use client';

import useSupabaseBrowser from '@/utils/supabase-browser';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const supabase = useSupabaseBrowser();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        // Refresh page on sign in/out to server render correct state
        router.refresh();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);


  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google', // Or other providers like 'github', 'azure' etc.
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
     router.push('/'); // Redirect to home after sign out
     router.refresh(); // Ensure server state is updated
  };

  if (loading) {
    return <button className="px-4 py-2 rounded bg-gray-200 text-gray-600 animate-pulse" disabled>Loading...</button>;
  }

  return user ? (
    <div className="flex items-center gap-4">
       <span className="text-sm hidden sm:inline">Hey, {user.email}!</span>
       <button onClick={handleSignOut} className="py-2 px-4 rounded-md no-underline bg-red-500 hover:bg-red-600 text-white">
         Logout
       </button>
    </div>
  ) : (
    <button onClick={handleSignIn} className="py-2 px-4 rounded-md no-underline bg-blue-500 hover:bg-blue-600 text-white">
      Login with Google
    </button>
  );
}