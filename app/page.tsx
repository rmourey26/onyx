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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-tech py-12 md:py-16 lg:py-24">
        <div className="container-tech max-w-7xl">
          <div className="max-w-5xl mx-auto text-center px-4 space-y-8">
            {/* Badge */}
            <div className="inline-block">
              <span className="badge-tech text-xs md:text-sm">
                Enterprise-Grade SaaS Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight heading-gradient">
              Onyx SaaS PWA Template
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Secure user authentication with RBAC, Zod validated Supabase Postgres DB CRUD operations, 
              Rust serverless API runtime, TanStack queries with Supabase cache helpers, Resend, SID.ai, 
              NextMDX, admin dashboard, and more. Onboard users and receive inquiries immediately.
            </p>

            {/* CTA Section */}
            <div className="pt-4">
              <Cta />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href={siteConfig.links.login}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: "lg", className: "btn-tech min-w-[140px]" })}
              >
                Login
              </Link>
              <Link
                target="_blank"
                rel="noreferrer"
                href={siteConfig.links.signup}
                className={buttonVariants({ variant: "outline", size: "lg", className: "btn-outline-tech min-w-[140px]" })}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-tech" />

      {/* Animated Infographic Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container-tech max-w-7xl">
          <AnimatedInfographic />
        </div>
      </section>

      <div className="divider-tech" />

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container-tech max-w-7xl">
          <Featurez />
        </div>
      </section>

      <div className="divider-tech" />

      {/* Why Onyx Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container-tech max-w-7xl">
          <WhyOnyxWrapper />
        </div>
      </section>
    </div>
  )
}
