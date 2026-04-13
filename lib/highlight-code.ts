import { createHash } from "crypto"
import { LRUCache } from "lru-cache"
import { type Highlighter, getSingletonHighlighter } from "shiki"

const THEMES = {
  light: "github-light",
  dark: "github-dark",
} as const

const LANGS = ["tsx", "bash", "json"] as const

const cache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
})

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter() {
  highlighterPromise ??= getSingletonHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: [...LANGS],
  })
  return highlighterPromise
}

export async function highlightCode(code: string, lang = "tsx") {
  const key = createHash("sha256").update(`${lang}:${code}`).digest("hex")

  const cached = cache.get(key)
  if (cached) return cached

  const highlighter = await getHighlighter()
  const html = highlighter.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
    transformers: [
      {
        pre(node) {
          node.properties["class"] = "shiki !bg-transparent"
        },
      },
    ],
  })

  cache.set(key, html)
  return html
}
