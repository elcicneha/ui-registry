"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { IconToggle } from "@/components/ui/icon-toggle"

export function CopyButton({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <Button
      type="button"
      variant="ghost"
      size="iconSm"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
        } catch {
          /* ignore */
        }
      }}
      className={cn(
        "",
        className
      )}
    >
      <span className="sr-only">Copy</span>
      <IconToggle
        isToggled={copied}
        primary={<Copy />}
        secondary={<Check />}
      />
    </Button>
  )
}
