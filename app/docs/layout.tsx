import { DocsSidebar } from "@/components/docs-sidebar"
import { DocToc } from "@/components/doc-toc"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full">
      {/* Left sidebar — 32px padding each side, no border */}
      <aside className="hidden w-66 shrink-0 md:block">
        <div className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-y-auto px-8 py-8">
          <DocsSidebar />
        </div>
      </aside>

      {/* Main content — max-w-2xl centered */}
      <div className="min-w-0 flex-1 px-8 py-10">
        <div className="mx-auto max-w-2xl">
          {children}
        </div>
      </div>

      {/* Right TOC — 32px padding each side, no border */}
      <aside className="hidden w-66 shrink-0 xl:block">
        <div className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-y-auto px-8 py-8">
          <DocToc />
        </div>
      </aside>
    </div>
  )
}
