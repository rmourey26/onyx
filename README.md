## Attention DApp Builders 
- Onyx Web3/DApp version/branch available called [Onyx One](https://github.com/quantum-one-dlt/onyx-one). Onyx One includes everything in Onyx plus a TanStack React Query powered Web3Modal and Wagmi SSR configuration allowing users to connect to any one of 380+ cryptographic wallets across every Ethereum virtual machine compatible chain. 

## What is Onyx?
- Onyx is a turnkey, full stack web app written in Typescript that includes role based access control (RBAC),
complete Supabase SSR Auth and DB integration, Zod and YUP! validation, Tanstack React Query, Markdown pages with ability to insert React components, React Hook form, and more. Fork, customize, and deploy on Vercel or elsewhere to have your MVP up and running in a few days or less. Stack details are below. 

## Stack and Features
- NextJS 14 App Router in Typescript 
- Supabase 
  - SSR Auth with
    - Fully configured email/password signup, login, oauth, PKCE and confirm routes 
    - middleware 
    - server actions
    - typed Auth & DB clients
    - readOnly userSession clients
  - Postgres DB with CRUD functions  configured
    - User account and profile management configured 
    - RBAC configured admin dashboard with data visualization, members administration and todo lists
    - Contact form with toast, Zod validation, server side table insert  
- TanStack React Query Provider
  - Demo SSR with Supabase DB & cache helpers 
- YUP! & Zod validation and schemas
- Shadcn-UI, Radix-UI primitives, Tailwind CSS
- Markdown pages with Next/MDX - create page.mdx and layout.tsx for each markdown page
- Next-PWA
- Next Compose Plugins  
- React Hook Form
- User profile at /account page
- OpenAI playground UI
- Onboarding, signIn/signUp pages
- Podcast UI
- CookieButton component configured to work with Consent Manager from Termly free plan. Just create a free Termly account, add your Script tag on the app/layout page using Next Script and then add your CookieButton to your app/layout just above the ThemeProvider and just below your termly Script tag.  
- Custom Formik Components with MUI are not used in app but code is solid for use in a "MUI Base X TailwindCSS config". Onyx is NOT currently configured for MUI nor MUI Base X TailwindCSS. 
- Lucide React Icons with many brand SVGs ready for your props 
- More..

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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frmourey26%2Fonyx%2Ftree%2Fmain)


## Reference/Credit
- @chensokheng


## Tips/Support
<a href="https://www.buymeacoffee.com/rmoureyjr" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="51" width="217"></a>
