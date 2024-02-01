import Link from "next/link"
import { SiteHeader } from '@/components/site-header'
import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  return (
   <>
    <SiteHeader>
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Onyx <br className="hidden sm:inline" />
          built with Shadcn UI.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
        Coming soon. 
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href={siteConfig.links.twitter}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants()}
        >
          Twitter
        </Link>
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.github}
          className={buttonVariants({ variant: "outline" })}
        >
          GitHub
        </Link>
      </div>
    </section>
    </SiteHeader>
    </>
  )
}