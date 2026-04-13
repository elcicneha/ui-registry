import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { registryItems, type RegistryItem } from "@/lib/registry-items"
import { cn } from "@/lib/utils"

function StatusBadge({ status }: { status: RegistryItem["status"] }) {
  if (!status) return null
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        status === "new" && "bg-primary/15 text-primary",
        status === "stable" && "bg-muted text-muted-foreground",
        status === "beta" &&
        "bg-amber-500/15 text-amber-600 dark:text-amber-400"
      )}
    >
      {label}
    </span>
  )
}

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4 py-16">
      {/* Hero */}
      <header className="relative flex flex-col gap-6">
        {/* Dot-grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-8 -top-8 h-64 opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.527 0.154 150.069 / 0.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 80%)",
          }}
        />

        <div className="relative flex flex-col gap-3">
          <h1
            className="display-h1"
          >
            Open-source React components<br />
            with UX best practices{" "}
            <em className="text-primary" >
              baked&nbsp;in.
            </em>
          </h1>

          {/* Philosophy callout */}
          <div className="animate-fade-up border-l-2 border-primary/40 pl-4 [animation-delay:100ms]">
            <p className="text-sm text-muted-foreground">
              Shadcn-compatible — copy, paste, and customize freely. Accessibility,
              keyboard navigation, and validation feedback come included by default.
              You don&apos;t have to think about them.
            </p>
          </div>
        </div>
      </header >

      {/* Component grid */}
      < main >
        <div className="grid gap-4 sm:grid-cols-2" role="list">
          {registryItems.map((item, i) => (
            <div
              key={item.name}
              role="listitem"
              className="group animate-fade-up"
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <div className="relative flex flex-col rounded-lg border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
                {/* Preview image */}
                <div className="relative h-40 overflow-hidden rounded-t-lg border-b bg-background">
                  {/* Light mode image */}
                  <Image
                    src={`/previews/${item.name}.png`}
                    alt={`${item.title} preview`}
                    fill
                    className={cn(
                      "transition-transform duration-300 group-hover:scale-[1.02] dark:hidden",
                      item.imageFit === "cover"
                        ? "object-cover object-top"
                        : "object-contain object-center p-6"
                    )}
                  />
                  {/* Dark mode image */}
                  <Image
                    src={`/previews/${item.name}-dark.png`}
                    alt={`${item.title} preview`}
                    fill
                    className={cn(
                      "hidden transition-transform duration-300 group-hover:scale-[1.02] dark:block",
                      item.imageFit === "cover"
                        ? "object-cover object-top"
                        : "object-contain object-center p-6"
                    )}
                  />
                  {item.status && (
                    <div className="absolute right-3 top-3">
                      <StatusBadge status={item.status} />
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-col gap-1 p-4">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-sm font-semibold tracking-tight after:absolute after:inset-0 after:z-10 after:content-['']"
                  >
                    {item.title}
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <p className="text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main >
    </div >
  )
}
