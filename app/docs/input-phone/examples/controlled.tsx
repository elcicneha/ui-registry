"use client"

import * as React from "react"
import { InputPhone } from "@/registry/new-york/blocks/input-phone/input-phone"

export default function ControlledExample() {
  const [value, setValue] = React.useState("")

  return (
    <div className="flex flex-col gap-2">
      <InputPhone
        defaultCountry="US"
        value={value}
        onChange={setValue}
        placeholder="Phone number"
      />
      {value && (
        <p className="text-xs text-muted-foreground font-mono">{value}</p>
      )}
    </div>
  )
}
