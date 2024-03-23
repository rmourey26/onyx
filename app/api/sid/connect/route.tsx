import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const params = {
      'response_type': 'code',
      'scope': 'query:data offline_access',
      'client_id': process.env.SID_CLIENT_ID,
      'redirect_uri': process.env.SID_REDIRECT_URI,
  };

  const authUrl = new URL('https://me.sid.ai/api/oauth/authorize');
  authUrl.search = new URLSearchParams(params).toString();

  return Response.redirect(authUrl.toString());
}
