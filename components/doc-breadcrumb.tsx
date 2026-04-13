import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface DocBreadcrumbProps {
  title: string
}

export function DocBreadcrumb({ title }: DocBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors">
        Components
      </Link>
      <ChevronRight className="size-3.5" aria-hidden />
      <span aria-current="page" className="text-foreground">
        {title}
      </span>
    </nav>
  )
}
