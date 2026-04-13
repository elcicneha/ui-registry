import * as React from "react"

import { cn } from "@/lib/utils"
import { CodeBlock } from "@/components/code-block"

/**
 * Preview frame for a live component demo, paired with a collapsible
 * code block underneath. The code block shows a short teaser with a
 * "View Code" button by default and expands to the full source on click.
 */
export function ComponentPreview({
  children,
  code,
  className,
  previewClassName,
}: {
  children: React.ReactNode
  code: string
  className?: string
  previewClassName?: string
}) {
  return (
    <div className={cn("", className)}>
      <div
        className={cn(
          "flex min-h-[260px] items-center justify-center rounded-t-lg border bg-card p-10",
          previewClassName
        )}
      >
        {children}
      </div>
      <CodeBlock
        className="rounded-t-none border-t-0"
        code={code}
        language="tsx"
        collapsible
        collapsedHeight="sm"
        expandLabel="View Code"
        collapseLabel="Hide Code"
      />
    </div>
  )
}
