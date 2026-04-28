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

  // Seed localStorage once on the origin so the layout's blocking script
  // picks the right theme on every subsequent load. Done after a no-op nav
  // because localStorage isn't writable until we're on the origin.
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" })

  // Render the preview at a given theme and capture the target element.
  // Theme is set in localStorage before navigation so the layout's blocking
  // script applies it before first paint — this matters because some
  // components resolve CSS variables to concrete colors at mount via
  // getComputedStyle, and the React ThemeContext only initializes once.
  async function captureAt(theme, url) {
    await page.evaluate((t) => {
      try {
        localStorage.setItem("theme", t)
      } catch {}
    }, theme)
    await page.goto(url, { waitUntil: "networkidle" })

    await page.addStyleTag({
      content: [
        "nextjs-portal, header, footer { display: none !important; }",
        "body { display: block !important; min-height: auto !important; }",
        "main { display: block !important; flex: none !important; }",
      ].join("\n"),
    })

    await page.evaluate(() => {
      const el = document.querySelector("[data-preview-target]")
      if (!el) return

      el.style.width = "400px"

      const children = Array.from(el.children)
      const child = children.find((c) => {
        const r = c.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })

      const componentWidth = (child ?? el).getBoundingClientRect().width
      const padding = 16 // p-2 = 8px each side

      el.style.width = `${componentWidth + padding}px`
      el.style.zoom = String(800 / (componentWidth + padding))
    })

    return page.locator("[data-preview-target]").screenshot()
  }

  try {
    for (const name of components) {
      const url = `${BASE_URL}/preview/${name}`
      const out = path.join(PREVIEWS_DIR, `${name}.png`)
      const darkOut = path.join(PREVIEWS_DIR, `${name}-dark.png`)
      process.stdout.write(`  ${name}… `)

      const lightBytes = await captureAt("light", url)
      writeFileSync(out, lightBytes)

      const darkBytes = await captureAt("dark", url)
      writeFileSync(darkOut, darkBytes)

      console.log(`saved → public/previews/${name}.png + ${name}-dark.png`)
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
