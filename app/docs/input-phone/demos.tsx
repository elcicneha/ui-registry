"use client"

import * as React from "react"

import { InputPhone } from "@/registry/new-york/blocks/input-phone/input-phone"

export function BasicDemo() {
  return <InputPhone defaultCountry="US" placeholder="Phone number" className="max-w-xs" />
}

export function ControlledDemo() {
  const [value, setValue] = React.useState("")
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
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

export function OneCountryDemo() {
  return <InputPhone country="US" placeholder="Phone number" className="max-w-xs" />
}

export function DefaultCountryDemo() {
  return <InputPhone defaultCountry="GB" placeholder="Phone number" className="max-w-xs" />
}

