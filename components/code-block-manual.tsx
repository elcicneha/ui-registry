"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export function CodeBlockManual({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol className={cn("flex flex-col", className)} {...props}>
      {children}
    </ol>
  )
}

export function CodeBlockManualStep({
  step,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement> & { step: number }) {
  return (
    <li className={cn("group flex gap-4", className)} {...props}>
      <div className="flex flex-col items-center">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-semibold text-muted-foreground">
          {step}
        </span>
        <div className="w-px flex-1 bg-border group-last:hidden" />
      </div>
      <div className="min-w-0 flex-1 pb-8 group-last:pb-0">{children}</div>
    </li>
  )
}

export function CodeBlockManualStepTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("font-medium", className)} {...props}>
      {children}
    </p>
  )
}

export function CodeBlockManualStepContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-3", className)} {...props}>
      {children}
    </div>
  )
}
