import * as React from "react"
import InputOTPBasic from "@/app/docs/input-otp/examples/basic"
import InputPhoneBasic from "@/app/docs/input-phone/examples/basic"
import ReferenceRangeBasic from "@/app/docs/reference-range/examples/basic"

// When adding a new component, add an entry here.
const previews: Record<string, React.ComponentType> = {
  "input-otp": InputOTPBasic,
  "input-phone": InputPhoneBasic,
  "reference-range": ReferenceRangeBasic,
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const Preview = previews[name]

  if (!Preview) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Unknown component: {name}
      </div>
    )
  }

  return (
    <div className="bg-background p-8">
      <div data-preview-target className="w-fit p-2">
        <Preview />
      </div>
    </div>
  )
}
