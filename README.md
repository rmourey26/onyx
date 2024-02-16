## What is Onyx?
- Onyx is a turnkey, full stack web app written in Typescript that includes role based access control, 
  complete Supabase SSR Auth and DB integration, Zod validation and more. Note the ZetaChain integration process began on 2-16-2024. Additional details on Zeta will be added soon. Stack details are below. 
  Fork, customize, and deploy on Vercel to have your MVP up and running in a few days or less.

## Stack 
- NextJS 14 App Router
- Supabase 
  - SSR Auth with middleware
  - Postgres DB 
  - React Query Provider
  - Middleware, Cookies, and headers configured
  - Built with @supabase/ssr using server actions
- Shadcn UI 
- React hook form 
- Zod Validation
- Tailwind CSS
- Formik 
- YUP!
- React Icons
- Lucide React

## API 
- TODO

## Getting started with Onyx:
- First, configure your environment
  - Create a file named .env.local in project root
  - Create a Supabase account and add the following to your env file
    - NEXT_PUBLIC_SUPABASE_KEY="Your supabase anon key"
    - SUPABASE_JWT_SECRET="Your supabase JWT secret"
    - NEXT_PUBLIC_SUPABASE_URL="Your supabase project URL"
    - SUPABASE_SERVIC_ROLE_KEY="Your supabase service role key"
  - Ensure your Supabase tables match the tables and types found in '@/lib/supabase'.
  - Add authorized development and production URL's to Supabase URL config. 
## Run  
- Development server:

```bash
npm i && npm run dev
# or
yarn i && yarn run dev
# or
pnpm i && pnpm dev
# or
bun i && bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Reference/Credit
- @chensokheng 

## Tips/Support
<a href="https://www.buymeacoffee.com/rmoureyjr" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="51" width="217"></a>
