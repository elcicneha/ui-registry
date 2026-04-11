import type { PackageManagerCommands } from "@/components/code-block-command"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://your-registry.com"

export function makeCliCommands(registryName: string): PackageManagerCommands {
  const url = `${baseUrl}/r/${registryName}.json`
  return {
    pnpm: `pnpm dlx shadcn@latest add ${url}`,
    npm: `npx shadcn@latest add ${url}`,
    yarn: `yarn dlx shadcn@latest add ${url}`,
    bun: `bunx shadcn@latest add ${url}`,
  }
}

export function makeDepsCommands(packages: string[]): PackageManagerCommands {
  const pkgs = packages.join(" ")
  return {
    pnpm: `pnpm add ${pkgs}`,
    npm: `npm install ${pkgs}`,
    yarn: `yarn add ${pkgs}`,
    bun: `bun add ${pkgs}`,
  }
}
