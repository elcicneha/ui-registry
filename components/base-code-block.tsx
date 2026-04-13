"use client"

import * as React from "react"
import { FileCode2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/registry/new-york/ui/collapsible"

type BaseProps = {
  code: string
  highlightedHtml?: string
  language?: string
  filename?: string
  className?: string
  maxHeight?: number | string
}

type StaticProps = BaseProps & {
  collapsible?: false
  expandLabel?: never
  collapseLabel?: never
  defaultOpen?: never
  collapsedHeight?: never
}

const COLLAPSED_HEIGHT = { default: "11rem", sm: "7rem" } as const

type CollapsibleProps = BaseProps & {
  collapsible: true
  expandLabel?: string
  collapseLabel?: string
  defaultOpen?: boolean
  collapsedHeight?: keyof typeof COLLAPSED_HEIGHT
}

export type CodeBlockProps = StaticProps | CollapsibleProps

export function BaseCodeBlock(props: CodeBlockProps) {
  if (props.collapsible) {
    return <CollapsibleCodeBlock {...props} />
  }
  return <StaticCodeBlock {...props} />
}

function FilenameHeader({
  filename,
  code,
  trailing,
}: {
  filename: string
  code: string
  trailing?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
      <div className="flex min-w-0 items-center gap-2">
        <FileCode2 className="size-3.5 shrink-0" />
        <span className="truncate font-mono">{filename}</span>
      </div>
      <div className="flex items-center gap-1">
        {trailing}
        <CopyButton value={code} />
      </div>
    </div>
  )
}

function CodeContent({
  code,
  highlightedHtml,
  language,
  className,
  style,
}: {
  code: string
  highlightedHtml?: string
  language?: string
  className?: string
  style?: React.CSSProperties
}) {
  if (highlightedHtml) {
    return (
      <div
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    )
  }
  return (
    <pre className={className} style={style}>
      <code data-language={language}>{code}</code>
    </pre>
  )
}

function StaticCodeBlock({
  code,
  highlightedHtml,
  language,
  filename,
  className,
  maxHeight,
}: StaticProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted/40",
        className
      )}
    >
      {filename ? (
        <FilenameHeader filename={filename} code={code} />
      ) : (
        <div className="absolute right-2 top-2 z-10">
          <CopyButton value={code} />
        </div>
      )}
      <CodeContent
        code={code}
        highlightedHtml={highlightedHtml}
        language={language}
        className="overflow-auto p-4 pr-12 text-sm leading-relaxed"
        style={maxHeight ? { maxHeight } : undefined}
      />
    </div>
  )
}

function CollapsibleCodeBlock({
  code,
  highlightedHtml,
  language,
  filename,
  className,
  expandLabel = "Expand",
  collapseLabel = "Collapse",
  defaultOpen = false,
  collapsedHeight = "default",
}: CollapsibleProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(
    null
  )

  // Measure the full content height so we can transition max-height
  // between the collapsed value and the real pixel height of the code.
  React.useLayoutEffect(() => {
    if (!contentRef.current) return
    setMeasuredHeight(contentRef.current.scrollHeight)
  }, [code])

  const collapsedRem = COLLAPSED_HEIGHT[collapsedHeight]
  const targetHeight = open
    ? measuredHeight != null ? `${measuredHeight}px` : collapsedRem
    : collapsedRem
  const toggleLabel = open ? collapseLabel : expandLabel

  const toggle = React.useCallback(() => setOpen((o) => !o), [])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-muted/40",
        className
      )}
    >
      {filename ? (
        <FilenameHeader
          filename={filename}
          code={code}
          trailing={
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {toggleLabel}
              </Button>
            </CollapsibleTrigger>
          }
        />
      ) : (
        /* No filename — still use a header bar so controls never overlap code */
        <div className="flex items-center justify-end gap-1 border-b bg-muted/30 px-2 py-1">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {toggleLabel}
            </Button>
          </CollapsibleTrigger>
          <CopyButton value={code} />
        </div>
      )}
      {/* Animated surface: owns its own ref, max-height, and transition
          so nothing Radix does on CollapsibleContent can interfere. */}
      <div
        ref={contentRef}
        style={{
          maxHeight: targetHeight,
          transition: "max-height 300ms ease-out",
        }}
        className="relative overflow-hidden"
      >
        <CodeContent
          code={code}
          highlightedHtml={highlightedHtml}
          language={language}
          className="overflow-x-auto p-4 text-sm leading-relaxed"
        />
        {!open && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 items-end justify-center bg-gradient-to-b from-transparent via-background/50 to-background pb-4"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggle}
              className="pointer-events-auto shadow-sm"
            >
              {expandLabel}
            </Button>
          </div>
        )}
      </div>
    </Collapsible>
  )
}
