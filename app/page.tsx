import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { readUserSession } from "@/utils/actions";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const { data: userSession } = await readUserSession();

	if (userSession.session) {
		return redirect("/dashboard");
	}
  return (
        <section className="container mt-10 px-2 lg:p-8 mx-auto flex flex-1 flex-col items-center justify-center gap-6 pb-8 pt-2 px-4 py-12 md:px-6 md:py-10 lg:py-24">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Onyx PWA MVP Template.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
         Secure, scalable, validated CRUD ops, Rust API runtime, and more.
        </p>
      </div>
      <div className="flex gap-4">
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
    </section>
  )
}