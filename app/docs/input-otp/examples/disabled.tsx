"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/new-york/blocks/input-otp/input-otp"

export default function DisabledExample({
  variant = "boxed",
}: {
  variant?: "boxed" | "joined"
}) {
  return (
    <InputOTP maxLength={6} disabled variant={variant}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
