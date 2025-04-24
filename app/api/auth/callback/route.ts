import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supa-server-actions';
import { cookies } from 'next/headers';


export async function GET(req: Request) {
  
 const { searchParams } = newURL(req.url);
 const accessToken = searchParams.get('access_token');
 const refreshToken = searchParams.get('refresh_token');
  
// Get the user from Supabase

const cookieStore = cookies();

const supabase = createClient(cookieStore);
  
const { data: { user }, error: userError } = await supabase.auth.getUser();
  
 if (userError || !user) {
    
  return NextResponse.json({ error: 'User not found' }, { status: 401});
  }
  
// Store the refresh token in the user_tokens table

const { error: tokenError } = await supabase
    .from('user_tokens')
    .upsert({ user_id: user.id, refresh_token: refreshToken});
 
  if (tokenError ) {
    
   return NextResponse.json({ error: tokenError.message }, { status: 500});
  }
 else {
  
  return NextResponse.redirect(newURL('/', process.env.NEXT_PUBLIC_BASE_URL)); 
// Adjust the redirect URL as necessary
 }
}
