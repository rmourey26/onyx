import type { Route } from 'next'
import Link from 'next/link'
import React from 'react'
 
function Card<T extends string>({ href }: { href: Route<T> | URL }) {
  return (
    <Link href={href}>
      <div>My Card</div>
    </Link>
  )
}