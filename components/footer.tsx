import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="flex w-full items-center justify-between px-6 py-6">
        <p className="text-sm">
          Developed by{" "}
          <a
            href="https://nehagupta.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Neha Gupta
          </a>
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/elcicneha"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            GitHub
          </a>
          <Link
            href="/about"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  )
}
