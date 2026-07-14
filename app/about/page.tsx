import type { Metadata } from "next"
import { TeamMember } from "@/components/team-member"

export const metadata: Metadata = {
  title: "About | Kronova",
  description: "Learn about our mission and team at Kronova.",
}

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Cody Clark",
      title: "CEO/Co-Founder",
      bio: "Strategic leader with a decade of experience in revenue growth, client acquisition, and partnerships. Proven in negotiations, market expansion, and driving success. Passionate about sustainability and climate change initiatives.",
      image: "https://quantumone.b-cdn.net/onyx/Cody-Clark-prof-bw.png",
    },
    {
      name: "Stacey Feeley",
      title: "Co-Founder",
      bio: "A seasoned entrepreneur deeply committed to social responsibility and enviromental initiatives. With a history of launching and scaling startups, she leads biz dev through innovative ventures.",
      image: "https://quantumone.b-cdn.net/onyx/Stacey_39352.jpg",
    },
    {
      name: "Melissa Till",
      title: "Co-Founder",
      bio: "20+ yrs of product launch and market development with an emphasis on Innovation that enhances the customer experience and builds brand loyalty.",
      image: "https://quantumone.b-cdn.net/onyx/2013-11-11_10.31.16.jpg",
    },
    {
      name: "Guiliana Schwab",
      title: "Co-Founder",
      bio: "An entreprenuer and expert in product design. Giuliana has helped multiple brands to create and execute new and innovative ideas in the marketplace.",
      image: "https://quantumone.b-cdn.net/onyx/Giuliana_39351.jpg",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Our Company</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We&apos;re on a mission to revolutionize the industry with innovative AI-powered solutions.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member) => (
            <TeamMember
              key={member.name}
              name={member.name}
              title={member.title}
              bio={member.bio}
              image={member.image}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
