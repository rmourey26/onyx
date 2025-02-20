import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { readUserSession } from "@/utils/actions";
import Features from "@/components/features"
import AnimatedInfographic from "@/components/animated-infographic"
import WhyResendItWrapper from "@/components/whyresenditwrapper"

import { redirect } from "next/navigation";

interface YouTubeID {
  youtubeID : string;
}

const youtubeID ="UC38fsAFWSN6MP1UZ-8tX_5w" as unknown as string;

export default async function IndexPage() {
  const { data: userSession } = await readUserSession();

	if (userSession.session) {
		return redirect("/dashboard");
	}
  return (
            <section className="container max-w-7xl mx-auto flex flex-1 flex-col space-y-16 items-center gap-6 pb-32 pt-20 sm:pt-40 sm:pb-24">
      <div className="flex mx-auto flex-col px-4 md:px-6 lg:px-8 items-center text-center gap-2">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Packagings Paradigm Shift 
        </h1>

           <div className="place-self-center max-w-auto aspect-video overflow-hidden rounded-lg shadow-lg space-y-8">

<iframe width="100%" height="100%" src="https://www.youtube.com/embed/rq0lS7ZKYFQ?si=GTgF6H3Rr78LRA2z" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
</div>
        <p className="mt-4 text-lg text-center text-muted-foreground sm:text-xl">
         Sustainable, brandable, reusable with blockchain and AI technology under the hood.  
        </p>
      </div>
     
      <div className="flex gap-6">
        <Link
          href={siteConfig.links.login}
          target="_blank"
          rel="noreferrer"
                    className={buttonVariants({ variant: "brand" })}
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
      <WhyResendItWrapper />
   <Features/>
   <AnimatedInfographic/>
    </section>
  )
}
