import { Package, BrainCircuit, Smile, Truck, ShieldCheck, TrendingUp, Recycle, Bot } from "lucide-react"
import { UseCaseCard } from "./use-case-card"

const useCases = {
  logistics: [
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Real-Time Package Tracking",
      description:
        "Know exactly where your products are at all times. Reduce lost packages and give your customers accurate, up-to-the-minute delivery updates they'll love.",
    },
    {
      icon: <Recycle className="h-8 w-8 text-green-500" />,
      title: "Sustainable Reusable Packaging",
      description:
        "Cut down on waste and packaging costs. Our smart, reusable packages show your customers you're an eco-friendly brand, which can win you more business.",
    },
    {
      icon: <Package className="h-8 w-8 text-primary" />,
      title: "AI-Powered Inventory Management",
      description:
        "Stop guessing how much stock to order. Our AI predicts what you'll sell, helping you avoid running out of popular items or wasting money on products that don't move.",
    },
  ],
  marketing: [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Personalized Product Recommendations",
      description:
        "Our AI learns what your customers love and automatically suggests other products they are likely to buy. It's like having a personal shopper for every visitor.",
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-green-500" />,
      title: "Automated Ad Campaigns",
      description:
        "Let our AI find more customers for you. It can create and manage your online ads to reach the right people, so you can focus on running your business.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Prove Product Authenticity",
      description:
        "For high-value goods, give customers peace of mind. Our blockchain technology creates a verifiable digital certificate for your products, proving they're the real deal.",
    },
  ],
  customerService: [
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "24/7 AI Customer Support",
      description:
        "Answer customer questions instantly, any time of day. Our smart chatbot can handle common queries, freeing up your team for more complex issues.",
    },
    {
      icon: <Smile className="h-8 w-8 text-green-500" />,
      title: "Proactive Problem Solving",
      description:
        "Turn a potential negative into a positive. Our system can spot a shipping delay before it becomes a problem and automatically notify your customer with a solution.",
    },
  ],
}

export function EcommerceUseCases() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Logistics & Operations */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Streamline Your Logistics & Operations</h2>
          <p className="mt-3 max-w-2xl mx-auto text-center text-lg text-foreground/70">
            From warehouse to customer doorstep, make every step faster, cheaper, and smarter.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {useCases.logistics.map((useCase) => (
              <UseCaseCard key={useCase.title} {...useCase} />
            ))}
          </div>
        </div>

        {/* Marketing & Sales */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Boost Your Marketing & Sales</h2>
          <p className="mt-3 max-w-2xl mx-auto text-center text-lg text-foreground/70">
            Attract more customers and increase sales with intelligent tools.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {useCases.marketing.map((useCase) => (
              <UseCaseCard key={useCase.title} {...useCase} />
            ))}
          </div>
        </div>

        {/* Customer Service */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center">Elevate Your Customer Service</h2>
          <p className="mt-3 max-w-2xl mx-auto text-center text-lg text-foreground/70">
            Create loyal customers with exceptional support and communication.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {useCases.customerService.map((useCase) => (
              <UseCaseCard key={useCase.title} {...useCase} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
