import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "About",
  description:
    "A personal library of shadcn-compatible components, built thoughtfully.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-16">
      <header className="flex flex-col gap-4">
        <h1
          className="display-h1"
        >
          Good UX isn&apos;t{" "}
          <em className="text-primary">optional.</em>
        </h1>
        <p>
          This is a personal library of shadcn-compatible components I&apos;ve
          made while working on actual projects. Each one came out of needing
          something that required a bit more thought than a standard component
          provides. The things I tend to care about — focus management,
          accessible error states, how a component feels on a phone — end up in
          the code. Not as a checklist, just as habit. Copy anything here,
          change whatever you need. I add to it as I go.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2>Who made this</h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Polaroid photo — drop your image at /public/neha.jpg */}
          <figure
            className="shrink-0 rotate-2 self-start bg-card p-3 pb-6 shadow-md transition-transform duration-300 hover:-rotate-1"
            style={{ width: 140 }}
          >
            <div className="relative h-28 w-full overflow-hidden bg-muted">
              <Image
                src="/meeee.jpg"
                alt="Neha Gupta"
                fill
                className="object-cover object-top"
              />
            </div>
            <figcaption className="mt-2 text-center text-xs text-neutral-400">
              hi, that&apos;s me
            </figcaption>
          </figure>

          <div className="flex flex-col gap-4">
            <p>
              I&apos;m Neha — product designer who can&apos;t stop building
              things. The details I care about at work end up baked into
              everything I make here too. This library is no different.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/elcicneha"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://nehagupta.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Using these components</h2>
        <p>
          Every component is distributed through the shadcn CLI — install one
          with a single command and own the source. No package to update, no
          API surface to maintain. Browse the{" "}
          <Link
            href="/"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            component library
          </Link>{" "}
          to see what&apos;s available.
        </p>
      </section>
    </div>
  )
}
