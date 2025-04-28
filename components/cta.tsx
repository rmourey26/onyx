"use client"

import Link from 'next/link'
import { siteConfig } from "@/config/site"
import { motion } from "framer-motion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from 'react'

export default function Cta() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardTitle className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold">Ready for Onyx?</CardTitle>
                <CardDescription className="mt-2 text-2xl font-bold">
                  Book a meeting today.
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="text-center">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 text-lg text-gray-600 dark:text-gray-300"
              >
                Discover how Onyx is redefining e-commerce. 
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 flex justify-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.contact}
          className={buttonVariants({ variant: "default"})}
        >
          Get Started
        </Link>
                 
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

