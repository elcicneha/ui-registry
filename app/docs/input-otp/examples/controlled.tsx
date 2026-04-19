"use client"

import * as React from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/new-york/blocks/input-otp/input-otp"

export default function ControlledExample({
  variant = "boxed",
}: {
  variant?: "boxed" | "joined"
}) {
  const [value, setValue] = React.useState("")

  return (
    <div className="flex flex-col items-center gap-4">
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
      <p className="text-center text-sm">
        {value === "" ? (
          "Enter your one-time password"
        ) : (
          <>
            You entered:{" "}
            <span className="font-mono font-medium text-foreground">{value}</span>
          </>
        )}
      </p>
    </div>
  )
}
