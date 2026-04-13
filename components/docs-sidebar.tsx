"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { registryItems } from "@/lib/registry-items"
import { cn } from "@/lib/utils"

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Component navigation">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Components
      </p>
      <ul className="space-y-0.5 list-none p-0">
        {registryItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent/50 pl-[10px] font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
