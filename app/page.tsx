import * as React from "react"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { Input } from "@/registry/new-york/blocks/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/new-york/blocks/input-otp/input-otp"

// This page displays items from the custom registry.
// You are free to implement this with your own design as needed.

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Custom Registry</h1>
        <p className="text-muted-foreground">
          A custom registry for distributing code using shadcn.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-8">

        <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[250px] relative">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              A one-time password input with individually boxed character
              slots, as an alternative to shadcn&apos;s default joined
              pill-style OTP.
            </h2>
            <OpenInV0Button name="input-otp" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[200px] relative">
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
          </div>
        </div>
      </main>
    </div>
  )
}
