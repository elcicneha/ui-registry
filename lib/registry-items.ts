export type RegistryItemStatus = "new" | "stable" | "beta"

export type RegistryItem = {
  name: string
  title: string
  description: string
  href: string
  status?: RegistryItemStatus
  /** "contain" (default) — object-contain centered, for small/short previews.
   *  "cover" — object-cover object-top, for tall previews that should show
   *  from the top and clip at the bottom. */
  imageFit?: "contain" | "cover"
}

export const registryItems: RegistryItem[] = [
  {
    name: "input-otp",
    title: "Input OTP",
    description:
      "A one-time password input with individually boxed character slots.",
    href: "/docs/input-otp",
    // status: "stable",
  },
  {
    name: "input-phone",
    title: "Input Phone",
    description:
      "Phone number input with searchable country picker, backed by react-phone-number-input.",
    href: "/docs/input-phone",
    // status: "stable",
  },
]
