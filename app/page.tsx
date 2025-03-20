import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { readUserSession } from "@/utils/actions";
import Featurez from "@/components/features"
import { redirect } from "next/navigation";
import CTA from "@/components/cta";
import AnimatedInfographic from "@/components/animated-infographic";
import WhyOnyxWrapper from "@/components/whyonyxwrapper";

export default async function IndexPage() {
  const { data: userSession } = await readUserSession();

        if (userSession.session) {
                return redirect("/dashboard");
        }
  return (
            <section className="container mx-auto flex flex-1 flex-col items-center gap-6 pb-32 pt-20 sm:pt-40 sm:pb-24">
      <div className="flex max-w-7xl flex-col px-4 md:px-6 lg:px-8 items-center text-center gap-2">
    
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter md:text-4xl mb-8">
          Onyx SaaS PWA Template
        </h1>
        <p className="max-w-2xl text-lg text-center text-muted-foreground mb-10 sm:text-xl">
         Secure, scalable, user authentication + RBAC, validated CRUD ops, Rust API runtime, TanStack, and more. 
        </p>
      </div>

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
      <AnimatedInfographic />
   <Featurez/>
   <WhyOnyxWrapper />
   <CTA />

    </section>
  )
}
