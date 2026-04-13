#!/usr/bin/env node
/**
 * Captures screenshot previews for homepage cards.
 *
 * Usage:
 *   pnpm capture-previews input-otp              # one component
 *   pnpm capture-previews input-otp input-phone  # several
 *   pnpm capture-previews --all                  # all components (explicit)
 *
 * Starts a dev server on port 3005 automatically if one isn't already running.
 */

import { chromium } from "playwright"
import { spawn } from "child_process"
import { readdirSync, existsSync, mkdirSync, writeFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const BASE_URL = "http://localhost:3005"
const PREVIEWS_DIR = path.join(ROOT, "public/previews")
const DOCS_DIR = path.join(ROOT, "app/docs")

function discoverComponents() {
  return readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        existsSync(path.join(DOCS_DIR, d.name, "examples", "basic.tsx"))
    )
    .map((d) => d.name)
}

async function waitForServer(timeout = 30_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL)
      if (res.ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Dev server not ready after ${timeout}ms`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error("Usage:")
    console.error("  pnpm capture-previews <name> [name...]")
    console.error("  pnpm capture-previews --all")
    process.exit(1)
  }

  const components = args.includes("--all") ? discoverComponents() : args

  if (components.length === 0) {
    console.log("No components found in app/docs — nothing to capture.")
    return
  }

  // Start the dev server on port 3005 if one isn't already running there.
  let serverProcess = null
  try {
    await fetch(BASE_URL)
    console.log("Using existing dev server on :3005.")
  } catch {
    console.log("Starting dev server on :3005…")
    serverProcess = spawn("pnpm", ["exec", "next", "dev", "--turbopack", "--port", "3005"], {
      cwd: ROOT,
      stdio: "pipe",
      detached: false,
    })
    await waitForServer()
    console.log("Dev server ready.")
  }

  mkdirSync(PREVIEWS_DIR, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 800, height: 320 })

  try {
    for (const name of components) {
      const url = `${BASE_URL}/preview/${name}`
      const out = path.join(PREVIEWS_DIR, `${name}.png`)
      process.stdout.write(`  ${name}… `)
      await page.goto(url, { waitUntil: "networkidle" })
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" })

      await page.evaluate(() => {
        const el = document.querySelector("[data-preview-target]")
        if (!el) return

        // Give the container a definite width so fluid (w-full) components
        // render at their natural max-width instead of collapsing.
        el.style.width = "400px"

        // getBoundingClientRect() forces a synchronous reflow, so this
        // measures the component at its correct rendered width.
        const child = el.firstElementChild
        const componentWidth = (child ?? el).getBoundingClientRect().width
        const padding = 16 // p-2 = 8px each side

        // Shrink container to tightly wrap the component (keeps shadow room).
        el.style.width = `${componentWidth + padding}px`

        // Zoom the whole thing to fill 800px.
        el.style.zoom = String(800 / (componentWidth + padding))
      })

      const bytes = await page.locator("[data-preview-target]").screenshot()
      writeFileSync(out, bytes)
      console.log(`saved → public/previews/${name}.png`)
    }
  } finally {
    await browser.close()
    serverProcess?.kill()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
