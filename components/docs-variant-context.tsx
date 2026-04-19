"use client"

import * as React from "react"

export type DocsVariant = "boxed" | "joined"

type DocsVariantContextValue = {
  variant: DocsVariant
  setVariant: (variant: DocsVariant) => void
}

const DocsVariantContext = React.createContext<DocsVariantContextValue | null>(
  null
)

export function DocsVariantProvider({
  defaultVariant = "boxed",
  children,
}: {
  defaultVariant?: DocsVariant
  children: React.ReactNode
}) {
  const [variant, setVariant] = React.useState<DocsVariant>(defaultVariant)
  const value = React.useMemo(() => ({ variant, setVariant }), [variant])

  return (
    <DocsVariantContext.Provider value={value}>
      {children}
    </DocsVariantContext.Provider>
  )
}

export function useDocsVariant() {
  const ctx = React.useContext(DocsVariantContext)
  if (!ctx) {
    throw new Error("useDocsVariant must be used inside <DocsVariantProvider>")
  }
  return ctx
}
