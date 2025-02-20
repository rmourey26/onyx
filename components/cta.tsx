import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <section className="border-t">
      <div className="container flex flex-col items-center gap-4 py-24 text-center md:py-32">
        <h2 className="font-extrabold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          Ready to join the movement?
        </h2>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Resend-It is the only reusable packaging company leveraging blockchain and AI technologies to incentivize consumers and streamline supply chains.  
        </p>
        <Button className="mt-4">
          Get Started Today
        </Button>
      </div>
    </section>
  )
}

