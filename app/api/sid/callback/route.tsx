import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // get authorization code from query string
  let code = request.nextUrl.searchParams.get('code');
  if (!code) {
    // show an error page to the user
    return Response.redirect('https://onyx-rho-pink.vercel.app/error');
  }
  
  // perform token exchange to get access token and refresh token
  let { accessToken, refreshToken } = await tokenExchange(code);

  // save tokens to database
  // ...

  // redirect user back to your application
  return Response.redirect('https://onyx-rho-pink.vercel.app/dashboard');
}
