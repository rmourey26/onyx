import { createServerClient } from "@supabase/ssr"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Database } from "./database.types"

export function createPagesSupabaseClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name]
        },
        set(name: string, value: string, options: any) {
          res.setHeader("Set-Cookie", `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`)
        },
        remove(name: string, options: any) {
          res.setHeader("Set-Cookie", `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
        },
      },
    },
  )
}
