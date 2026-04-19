"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type InputOTPVariant = "boxed" | "joined"

const InputOTPVariantContext = React.createContext<InputOTPVariant>("boxed")

function InputOTP({
  className,
  containerClassName,
  variant = "boxed",
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
  variant?: InputOTPVariant
}) {
  return (
    <InputOTPVariantContext.Provider value={variant}>
      <OTPInput
        data-slot="input-otp"
        data-variant={variant}
        containerClassName={cn(
          "flex w-fit items-center has-disabled:opacity-50",
          variant === "boxed" ? "gap-3" : "gap-2",
          containerClassName
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      />
    </InputOTPVariantContext.Provider>
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  const variant = React.useContext(InputOTPVariantContext)
  return (
    <div
      data-slot="input-otp-group"
      data-variant={variant}
      className={cn(
        "flex items-center",
        variant === "boxed" && "gap-2",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const variant = React.useContext(InputOTPVariantContext)
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-variant={variant}
      data-active={isActive}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-input text-sm shadow-xs transition-[color,box-shadow] outline-none aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        variant === "boxed"
          ? "rounded-md border"
          : "border-y border-r first:rounded-l-md first:border-l last:rounded-r-md",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
export { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
