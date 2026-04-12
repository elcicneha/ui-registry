"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/new-york/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"

type InputPhoneProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void
    /**
     * Lock the input to a specific country. No country picker is shown and
     * only phone numbers belonging to that country are accepted.
     * When omitted the full international picker is available.
     */
    country?: RPNInput.Country
  }

const InputPhone = React.forwardRef<
  React.ComponentRef<typeof RPNInput.default>,
  InputPhoneProps
>(({ className, onChange, value, country, ...props }, ref) => {
  return (
    <div
      data-slot="input-phone"
      className={cn(
        "flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none overflow-hidden dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
    >
      <RPNInput.default
        ref={ref}
        className="flex w-full h-full items-center"
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={PhoneInputField}
        smartCaret={false}
        value={value || undefined}
        onChange={(v) => onChange?.(v || ("" as RPNInput.Value))}
        {...props}
        {...(country && { defaultCountry: country, countries: [country] })}
      />
    </div>
  )
})
InputPhone.displayName = "InputPhone"

const PhoneInputField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <input
    data-slot="input-phone-field"
    ref={ref}
    className={cn(
      "flex-1 min-w-0 bg-transparent px-3 py-1 text-base outline-none",
      "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
      "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      "md:text-sm",
      className,
    )}
    {...props}
  />
))
PhoneInputField.displayName = "PhoneInputField"

type CountryEntry = { label: string; value: RPNInput.Country | undefined }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

function CountrySelect({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const listRef = React.useRef<HTMLDivElement>(null)

  const validCountries = countryList.filter((c) => c.value)
  const isSingleCountry = validCountries.length <= 1

  // cmdk doesn't reset scroll when the list filters — do it manually.
  React.useEffect(() => {
    if (search && listRef.current) {
      requestAnimationFrame(() => {
        const list = listRef.current?.querySelector<HTMLElement>(
          "[data-slot='command-list']",
        )
        if (list) list.scrollTop = 0
      })
    }
  }, [search])

  return (
    <>
      <Popover
        open={isOpen}
        modal
        onOpenChange={(open) => {
          if (isSingleCountry) return
          setIsOpen(open)
          if (!open) setSearch("")
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className={cn(
              "h-full rounded-none px-2.5 has-[>svg]:pl-2.5 has-[>svg]:pr-1.5 gap-1.5 text-sm font-normal",
              "focus-visible:ring-0 focus-visible:border-transparent focus-visible:ring-offset-0",
              isSingleCountry && "pointer-events-none cursor-default",
            )}
          >
            <FlagComponent
              country={selectedCountry}
              countryName={selectedCountry}
            />
            <span className="tabular-nums tracking-wide">
              +{RPNInput.getCountryCallingCode(selectedCountry)}
            </span>
            {!isSingleCountry && (
              <ChevronsUpDown className="size-4 opacity-50" aria-hidden />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <div ref={listRef}>
            <Command value={search ? "" : selectedCountry}>
              <CommandInput
                placeholder="Search country…"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="h-72 max-h-72">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countryList.map(({ value, label }) =>
                    value ? (
                      <CountrySelectOption
                        key={value}
                        country={value}
                        countryName={label}
                        selectedCountry={selectedCountry}
                        onChange={onChange}
                        onSelectComplete={() => setIsOpen(false)}
                      />
                    ) : null,
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
      <span className="h-5 w-px bg-input shrink-0" aria-hidden />
    </>
  )
}

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country
  onChange: (country: RPNInput.Country) => void
  onSelectComplete: () => void
}

function CountrySelectOption({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) {
  return (
    <CommandItem
      className="gap-2"
      value={country}
      keywords={[countryName]}
      onSelect={() => {
        onChange(country)
        onSelectComplete()
      }}
    >
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">
        +{RPNInput.getCountryCallingCode(country)}
      </span>
      <CheckIcon
        className={cn(
          "ml-auto size-4",
          country === selectedCountry ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  )
}

function FlagComponent({ country, countryName }: RPNInput.FlagProps) {
  const Flag = flags[country]
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-xs bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  )
}

export { InputPhone }
