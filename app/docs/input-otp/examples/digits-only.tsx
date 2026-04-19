"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "@/registry/new-york/blocks/input-otp/input-otp"

export default function DigitsOnlyExample({
  variant = "boxed",
}: {
  variant?: "boxed" | "joined"
}) {
  return (
    <InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS} variant={variant}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  )
}
