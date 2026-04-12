import * as React from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/new-york/blocks/input-otp/input-otp"
import { InputPhone } from "@/registry/new-york/blocks/input-phone/input-phone"

type RegistryItem = {
  name: string
  title: string
  description: string
  href: string
  preview: React.ReactNode
}

const items: RegistryItem[] = [
  {
    name: "input-otp",
    title: "Input OTP",
    description:
      "A one-time password input with individually boxed character slots.",
    href: "/docs/input-otp",
    preview: (
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    ),
  },
  {
    name: "input-phone",
    title: "Input Phone",
    description:
      "Phone number input with searchable country picker, backed by react-phone-number-input.",
    href: "/docs/input-phone",
    preview: <InputPhone defaultCountry="US" placeholder="Phone number" />,
  },
]

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Custom Registry</h1>
        <p className="text-muted-foreground">
          A small collection of shadcn-compatible components, distributed via
          the shadcn CLI.
        </p>
      </header>

      <main className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Components
        </h2>
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.name}
              className="group relative flex flex-col gap-4 rounded-lg border bg-card p-5 transition-colors hover:bg-accent/40"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-base font-semibold tracking-tight after:absolute after:inset-0 after:content-['']"
                >
                  {item.title}
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className="flex min-h-[120px] items-center justify-center rounded-md border bg-background p-6">
                {item.preview}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
