"use client"

import * as React from "react"
import { Terminal } from "lucide-react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun"

export type PackageManagerCommands = Record<PackageManager, string>

const ORDER: PackageManager[] = ["pnpm", "npm", "yarn", "bun"]

/**
 * A shadcn-docs-style command surface with pnpm / npm / yarn / bun
 * tabs in the header. Adapted from:
 * https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/code-block-command.tsx
 */
export function CodeBlockCommand({
  commands,
  className,
}: {
  commands: PackageManagerCommands
  className?: string
}) {
  const [pm, setPm] = React.useState<PackageManager>("pnpm")
  const activeCommand = commands[pm]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-muted/40",
        className
      )}
    >
      <Tabs
        value={pm}
        onValueChange={(value) => setPm(value as PackageManager)}
        className="gap-0"
      >
        <div className="flex items-center gap-2 border-b border-border/50 px-3 py-1">
          <div className="flex size-4 items-center justify-center rounded-[1px] bg-foreground opacity-70">
            <Terminal className="size-3 text-background" />
          </div>
          <TabsList variant="command">
            {ORDER.map((key) => (
              <TabsTrigger
                key={key}
                value={key}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {ORDER.map((key) => (
          <TabsContent
            key={key}
            value={key}
            className="mt-0 overflow-x-auto px-4 py-3.5"
          >
            <pre className="pr-8">
              <code
                className="font-mono text-sm leading-none text-foreground/90"
                data-language="bash"
              >
                {commands[key]}
              </code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
      <div className="absolute right-2 top-2 z-10">
        <CopyButton value={activeCommand} />
      </div>
    </div>
  )
}
