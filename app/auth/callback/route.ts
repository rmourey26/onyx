//app/auth/callback/route.ts

import
 { NextResponse } 
from
 
'next/server'
;
import
 { createClient } 
from
 
'@supabase/supabase-js'
;
const
 supabaseUrl = process.env.SUPABASE_URL!;
const
 supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const
 supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export async function GET
(
req: Request
) 
{
  
const
 { searchParams } = 
new
 URL(req.url);
  
const
 code = searchParams.get(
'code'
);
  
const
 codeVerifier = searchParams.get(
'code_verifier'
);
  
if
 (!code || !codeVerifier) {
    
return
 NextResponse.json({ 
error
: 
'Missing code or code_verifier'
 }, { 
status
: 
400
 });
  }
  
// Exchange the authorization code for an access token

  
const
 { data, error } = 
await
 supabaseClient.auth.exchangeCodeForToken(code, codeVerifier);
  
if
 (error) {
    
return
 NextResponse.json({ 
error
: error.message }, { 
status
: 
400
 });
  }
  
return
 NextResponse.json(data, { 
status
: 
200
 });
}
