import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

type RegistryItem = {
  name: string
  title: string
  description: string
  href: string
}

const items: RegistryItem[] = [
  {
    name: "input-otp",
    title: "Input OTP",
    description:
      "A one-time password input with individually boxed character slots.",
    href: "/docs/input-otp",
  },
  {
    name: "input-phone",
    title: "Input Phone",
    description:
      "Phone number input with searchable country picker, backed by react-phone-number-input.",
    href: "/docs/input-phone",
  },
]

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1>Custom Registry</h1>
        <p>
          A small collection of shadcn-compatible components, distributed via
          the shadcn CLI.
        </p>
      </header>

      <main className="flex flex-col gap-4">
        <div className="flex flex-col gap-4" role="list">
          {items.map((item) => (
            <div
              key={item.name}
              className="group relative flex flex-col gap-4 rounded-lg border bg-card p-5 transition-colors hover:bg-accent/40"
              role="listitem"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-base font-semibold tracking-tight after:absolute after:inset-0 after:z-10 after:content-['']"
                >
                  {item.title}
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <p>{item.description}</p>
              </div>
              <div className="relative h-32 overflow-hidden rounded-md border bg-background">
                <Image
                  src={`/previews/${item.name}.png`}
                  alt={`${item.title} preview`}
                  fill
                  className="object-contain object-top p-8"
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
