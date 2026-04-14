import { redirect } from "next/navigation"
import { registryItems } from "@/lib/registry-items"

export default function DocsPage() {
  redirect(registryItems[0].href)
}
