"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type TocEntry = {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export function DocToc() {
  const pathname = usePathname()
  const [entries, setEntries] = React.useState<TocEntry[]>([])
  const [activeId, setActiveId] = React.useState<string>("")

  // Rebuild TOC whenever the route changes
  React.useEffect(() => {
    // Small defer so the new page's DOM is committed before we query
    const id = requestAnimationFrame(() => {
      const headings = Array.from(
        document.querySelectorAll<HTMLHeadingElement>("h2, h3")
      )

      const built: TocEntry[] = headings
        .map((el) => {
          const text = el.textContent?.trim() ?? ""
          if (!text) return null

          const slug = el.id || slugify(text)
          if (!el.id) el.id = slug

          return {
            id: slug,
            text,
            level: parseInt(el.tagName[1]) as 2 | 3,
          }
        })
        .filter(Boolean) as TocEntry[]

      setEntries(built)
      setActiveId("") // reset active on page change
    })

    return () => cancelAnimationFrame(id)
  }, [pathname])

  // Track active heading via IntersectionObserver
  React.useEffect(() => {
    if (entries.length === 0) return

    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    )

    entries.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1.5 list-none p-0">
        {entries.map((entry) => (
          <li key={entry.id} className={cn(entry.level === 3 && "pl-3")}>
            <a
              href={`#${entry.id}`}

              className={cn(
                "block rounded text-sm leading-relaxed transition-colors",
                activeId === entry.id
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
