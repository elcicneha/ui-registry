"use client"

import * as React from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
})

export function useTheme() {
  return React.useContext(ThemeContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("light")

  // Sync state with whatever the blocking script set on <html>
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
  }, [])

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light"
      document.documentElement.classList.toggle("dark", next === "dark")
      try {
        localStorage.setItem("theme", next)
      } catch {}
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
