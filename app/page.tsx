import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { readUserSession } from "@/utils/actions";
import Featurez from "@/components/features"
import { redirect } from "next/navigation";
import Cta from "@/components/cta";
import AnimatedInfographic from "@/components/animated-infographic";
import WhyOnyxWrapper from "@/components/whyonyxwrapper";
import PrismContainer from "@/components/prism-container"

export default async function IndexPage() {
  const { data: userSession } = await readUserSession();

        if (userSession.session) {
                return redirect("/dashboard");
        }
  return (
   
<section className="relative max-w-dvw w-full overflow-hidden bg-arctic-gradient pb-16">
<div className="container px-4 py-8 mx-auto flex flex-col space-y-16 items-center pb-16 pt-16 sm:pt-16 sm:pb-24">
      <div className="flex mx-auto flex-col px-4 md:px-6 lg:px-8 w-full items-center gap-y-12">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tighter md:text-6xl text-center">
          Onyx SaaS PWA Template
        </h1>

     {*/ Uses Fibonacci Golden Ratio to create visualization. Updating deps to enable. 
        Check out working implementation at rmourey26/3d-prism-infographic 3d-prism-infographic.vercel.app
        <PrismContainer />
      */}
        <p className="max-w-3xl text-lg lg:text-xl xs:text-justify text-muted-foreground">
         Secure user authentication + RBAC, Zod validated Supabase Postgres DB CRUD ops, Rust serverless API runtime, TanStack queries with Supabase cache helpers, Resend, SID.ai, NextMDX, admin dashboard, and more. Onboard users and receive inquiries immediately. 
        </p>
      </div>
      <Cta />
      <div className="flex gap-6 mb-8">
        <Link
          href={siteConfig.links.login}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants()}
        >
          Login
        </Link>
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.signup}
          className={buttonVariants({ variant: "outline" })}
        >
          Sign Up
        </Link>
        </div>
      </div>
      <AnimatedInfographic />
   <Featurez/>
   <WhyOnyxWrapper />
    </section>
  )
}
