import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { OAuthConsentClient } from "./oauth-consent-client"

export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const authorizationId = resolvedSearchParams.authorization_id

  if (!authorizationId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Invalid Request</h1>
          <p className="text-muted-foreground">Missing authorization_id parameter</p>
        </div>
      </div>
    )
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const cookieStore = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login, preserving authorization_id
    redirect(`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`)
  }

  // Get authorization details using the Supabase native OAuth method
  const { data: authDetails, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId)

  if (error || !authDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Authorization Error</h1>
          <p className="text-muted-foreground">{error?.message || "Invalid authorization request"}</p>
        </div>
      </div>
    )
  }

  return <OAuthConsentClient authDetails={authDetails} authorizationId={authorizationId} user={user} />
}
