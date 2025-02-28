"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from 'react' 

export default function CTA() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16 lg:py-20">
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
                <CardTitle className="text-3xl font-extrabold sm:text-4xl">Ready for Onyx?</CardTitle>
                <CardDescription className="mt-2 text-2xl font-bold text-brand-green-dark dark:text-brand-green-light">
                  Book a demo today.
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
                Discover how Onyx is redefining business. 
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 flex justify-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="px-8 py-3 text-lg font-semibold">
                    Get started
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

