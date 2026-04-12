import * as React from "react"

import { ComponentPreview } from "@/components/component-preview"

/**
 * A titled example block used in docs pages. Renders a heading, an optional
 * description, and a ComponentPreview (live demo + collapsible code).
 */
export function DocExample({
  title,
  description,
  code,
  children,
}: {
  title: string
  description?: React.ReactNode
  code: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <ComponentPreview code={code}>{children}</ComponentPreview>
    </div>
  )
}
