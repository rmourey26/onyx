import
 { NextResponse } 
from
 
'next/server'
;
import
 { createClient } 
from
 
'@/utils/supa-server-actions'
; 

import { cookies } from 'next/headers'

export async function GET() {

const cookieStore = cookies();

const supabase = createClient(cookieStore);

// Register this immediately after calling createClient!
// Because signInWithOAuth causes a redirect, you need to fetch the
// provider tokens from the callback.

supabase.auth.onAuthStateChange((event, session) => {
  if (session && session.provider_token) {
    window.localStorage.setItem('oauth_provider_token', session.provider_token)
  }
  if (session && session.provider_refresh_token) {
    window.localStorage.setItem('oauth_provider_refresh_token', session.provider_refresh_token)
  }
  if (event === 'SIGNED_OUT') {
    window.localStorage.removeItem('oauth_provider_token')
    window.localStorage.removeItem('oauth_provider_refresh_token')
  }
})

const
 { user, session, error } = 
await
 supabase.auth.signInWithOAuth({
    
provider
: 
'google'
,
  });
  
if
 (error) {
    
return
 NextResponse.json({ 
error
: error.message }, { 
status
: 
401
 });
  }
  
// Redirect to the callback URL after successful authentication

  
return
 NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL)); 
// Adjust the redirect URL as necessary

}