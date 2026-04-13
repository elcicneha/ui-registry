import Link from "next/link"
import { FaGithub } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { NavLinks } from "@/components/nav-links"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 w-full items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-semibold text-sm tracking-tight text-foreground"
          >
            UI Registry
          </Link>
          <NavLinks />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/elcicneha"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
