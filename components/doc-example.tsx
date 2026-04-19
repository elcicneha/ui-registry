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
  actions,
}: {
  title: string
  description?: React.ReactNode
  code: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3>{title}</h3>
        {description && (
          <p>{description}</p>
        )}
      </div>
      <ComponentPreview code={code} actions={actions}>{children}</ComponentPreview>
    </div>
  )
}
