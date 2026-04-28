"use client"

import * as React from "react"
import { Palette } from "lucide-react"

import { cn } from "@/lib/utils"
import { CodeContent } from "@/components/base-code-block"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export type ColorFormat = "oklch" | "hex" | "rgb" | "hsl"

export type ColorFormatSnippets = Record<ColorFormat, string>
export type ColorFormatHighlighted = Partial<Record<ColorFormat, string>>

const ORDER: ColorFormat[] = ["oklch", "hex", "rgb", "hsl"]

const COLLAPSED_HEIGHT = "11rem"
const DEFAULT_MAX_EXPANDED = "18rem"

export function CodeBlockColorTokens({
  snippets,
  highlighted,
  className,
  defaultOpen = false,
  maxExpandedHeight = DEFAULT_MAX_EXPANDED,
}: {
  snippets: ColorFormatSnippets
  highlighted?: ColorFormatHighlighted
  className?: string
  defaultOpen?: boolean
  /** Any CSS length (rem preferred for accessibility, px, etc.). */
  maxExpandedHeight?: string
}) {
  const [format, setFormat] = React.useState<ColorFormat>("oklch")
  const [open, setOpen] = React.useState(defaultOpen)
  const active = snippets[format]
  const activeHtml = highlighted?.[format]

  const contentRef = React.useRef<HTMLDivElement>(null)
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(
    null
  )
  const [maxExpandedPx, setMaxExpandedPx] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    if (!contentRef.current) return
    setMeasuredHeight(contentRef.current.scrollHeight)

    // Resolve maxExpandedHeight (rem/px/etc.) to px against the user's root font-size.
    const probe = document.createElement("div")
    probe.style.position = "absolute"
    probe.style.visibility = "hidden"
    probe.style.height = maxExpandedHeight
    document.body.appendChild(probe)
    setMaxExpandedPx(probe.getBoundingClientRect().height)
    probe.remove()
  }, [active, activeHtml, maxExpandedHeight])

  const expandedHeight =
    measuredHeight != null && maxExpandedPx != null
      ? measuredHeight < maxExpandedPx
        ? `${measuredHeight}px`
        : maxExpandedHeight
      : maxExpandedHeight
  const targetHeight = open ? expandedHeight : COLLAPSED_HEIGHT
  const needsScroll =
    open &&
    measuredHeight != null &&
    maxExpandedPx != null &&
    measuredHeight > maxExpandedPx

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-muted/40",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-1">
        <div className="flex size-4 items-center justify-center rounded-[1px] bg-foreground opacity-70">
          <Palette className="size-3 text-background" />
        </div>
        <Tabs
          value={format}
          onValueChange={(value) => setFormat(value as ColorFormat)}
        >
          <TabsList variant="command">
            {ORDER.map((key) => (
              <TabsTrigger key={key} value={key}>
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Collapse" : "Expand"}
          </Button>
          <CopyButton value={active} />
        </div>
      </div>
      <div
        ref={contentRef}
        style={{
          maxHeight: targetHeight,
          transition: "max-height 300ms ease-out",
        }}
        className={cn("relative", needsScroll ? "overflow-auto" : "overflow-hidden")}
      >
        <CodeContent
          code={active}
          highlightedHtml={activeHtml}
          language="css"
          className={cn(
            "p-4 text-sm leading-relaxed",
            open ? "overflow-x-auto" : "overflow-hidden"
          )}
        />
      </div>
      {!open && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 items-end justify-center bg-gradient-to-b from-transparent via-background/50 to-background pb-4"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="pointer-events-auto shadow-sm"
          >
            Expand
          </Button>
        </div>
      )}
    </div>
  )
}
