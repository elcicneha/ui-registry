import fs from "node:fs/promises"
import path from "node:path"

/**
 * Reads an example source file and rewrites it for display:
 * - strips the "use client" directive
 * - rewrites internal registry import paths to consumer-facing paths
 */
export async function loadExampleSource(filePath: string): Promise<string> {
  const raw = await fs.readFile(path.join(process.cwd(), filePath), "utf-8")
  return fixRegistryImports(raw)
}

/**
 * Transforms internal registry import paths to the paths a consumer would use
 * after installing via `shadcn add`.
 *
 * @/registry/new-york/blocks/<name>/<file>  →  @/components/ui/<name>
 */
export function fixRegistryImports(code: string): string {
  code = code.replace(/^"use client"\n\n?/m, "")
  return code.replace(
    /@\/registry\/new-york\/blocks\/([\w-]+)\/[\w-]+/g,
    "@/components/ui/$1"
  )
}
