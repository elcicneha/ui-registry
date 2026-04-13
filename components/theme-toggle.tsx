"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { IconToggle } from "@/components/ui/icon-toggle"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <IconToggle
        isToggled={isDark}
        primary={<Sun className="size-4" />}
        secondary={<Moon className="size-4" />}
      />
    </Button>
  )
}
