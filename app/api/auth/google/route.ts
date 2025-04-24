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

const
 { user, session, error } = 
await
 supabase.auth.signIn({
    
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
 NextResponse.redirect(
new
 URL(
'/'
, process.env.NEXT_PUBLIC_BASE_URL)); 
// Adjust the redirect URL as necessary

}