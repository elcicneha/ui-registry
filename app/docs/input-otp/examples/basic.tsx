"use client"

import * as React from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/new-york/blocks/input-otp/input-otp"

export default function BasicExample({
  variant = "boxed",
}: {
  variant?: "boxed" | "joined"
}) {
  const [value, setValue] = React.useState("")

  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={setValue}
      variant={variant}
    >
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
