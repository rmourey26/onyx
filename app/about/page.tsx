"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, Star, Zap, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-4"
        >
          About Our Company
        </motion.h1>
        <p className="text-xl text-muted-foreground">
          We&#39;re on a mission to revolutionize the industry with innovative solutions.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-semibold mb-8 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center">{member.bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-semibold mb-8 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-16"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold mb-4">Contact Us</CardTitle>
            <CardDescription>Have questions? Get in touch with our team.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="First Name" />
                <Input placeholder="Last Name" />
              </div>
              <Input type="email" placeholder="Email" />
              <Textarea placeholder="Your message" />
              <Button type="submit">
                Send Message
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}

const teamMembers = [
  {
    name: "Cody Clark",
    role: "CEO/Co-Founder",
    bio: "Strategic leader with a decade of experience in revenue growth, client acquisition, and partnerships. Proven in negotiations, market expansion, and driving success. Passionate about sustainability and climate change initiatives.",
    avatar: "https://quantumone.b-cdn.net/onyx/cody_clark_profile-bw.png",
  },
  {
    name: "Matt Dye",
    role: "CAO/Co-Founder",
    bio: "Former Big 4 accountant turned ecommerce brand owner. 10 years experience with starting, growing and selling ecommerce stores. Very passionate about sustainability and climate change.",
    avatar: "https://quantumone.b-cdn.net/onyx/matt_pic.jpg",
  },
  {
    name: "Stacey Feeley",
    role: "Co-Founder",
    bio: "A seasoned entrepreneur deeply committed to social responsibility and enviromental initiatives. With a history of launching and scaling  startups, she leads biz dev through innovative ventures.",
    avatar: "https://quantumone.b-cdn.net/onyx/Stacey_39352.jpg",
  },
  {
    name: "Melissa Till",
    role: "Co-Founder",
    bio: "20+ yrs of product launch and market development with an emphasis on Innovation that enhances the customer experience and builds brand loyalty.",
    avatar: "https://quantumone.b-cdn.net/onyx/2013-11-11_10.31.16.jpg",
  },
  {
    name: "Guiliana Schwab",
    role: "Co-Founder",
    bio: "An entreprenuer and expert in product design. Giuliana has helped multiple brands to create and execute new and innovative ideas in the marketplace.",
    avatar: "https://quantumone.b-cdn.net/onyx/Giuliana_39351.jpg",
  },
  
]

const values = [
  {
    title: "Innovation",
    description: "We constantly push boundaries to create groundbreaking solutions.",
    icon: <Star className="w-12 h-12 mx-auto text-primary" />,
  },
  {
    title: "Efficiency",
    description: "We optimize our processes to deliver results quickly and effectively.",
    icon: <Zap className="w-12 h-12 mx-auto text-primary" />,
  },
  {
    title: "Integrity",
    description: "We uphold the highest standards of honesty and transparency in all we do.",
    icon: <Shield className="w-12 h-12 mx-auto text-primary" />,
  },
]

