"use client"

import * as React from "react"
import { InputPhone } from "@/registry/new-york/blocks/input-phone/input-phone"

export default function ControlledExample() {
  const [value, setValue] = React.useState("")

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <InputPhone
        defaultCountry="US"
        value={value}
        onChange={setValue}
        placeholder="Phone number"
      />
      <p className="text-center text-sm">
        {value === "" ? (
          "Enter your one-time password"
        ) : (
          <>
            You entered:{" "}
            <span className="font-mono font-medium text-foreground">{value}</span>
          </>
        )}
      </p>
    </div>
  )
}
