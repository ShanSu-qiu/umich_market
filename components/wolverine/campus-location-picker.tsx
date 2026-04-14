"use client"

import { useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { pickupLocations } from "@/lib/data"
import { MapPin, PenLine } from "lucide-react"

const CUSTOM_KEY = "__custom__"

interface CampusLocationPickerProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}

export function CampusLocationPicker({ value, onValueChange, placeholder = "Select pickup location" }: CampusLocationPickerProps) {
  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState("")

  // Check if current value is one of the preset locations
  const allPresets = Object.values(pickupLocations).flat()
  const isPresetValue = value ? allPresets.includes(value) : false

  const handleSelectChange = (selected: string) => {
    if (selected === CUSTOM_KEY) {
      setIsCustom(true)
      // If there was a custom value typed before, restore it
      if (customValue) {
        onValueChange?.(customValue)
      } else {
        onValueChange?.("")
      }
    } else {
      setIsCustom(false)
      setCustomValue("")
      onValueChange?.(selected)
    }
  }

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomValue(val)
    onValueChange?.(val)
  }

  const handleBackToSelect = () => {
    setIsCustom(false)
    setCustomValue("")
    onValueChange?.("")
  }

  if (isCustom || (value && !isPresetValue && value !== "")) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter your pickup location..."
            value={isCustom ? customValue : value}
            onChange={handleCustomInput}
            className="pl-9"
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={handleBackToSelect}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Or choose from campus buildings
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={CUSTOM_KEY}>
            <span className="flex items-center gap-2">
              <PenLine className="w-4 h-4" />
              Enter custom location
            </span>
          </SelectItem>
          {Object.entries(pickupLocations).map(([area, locations]) => (
            <SelectGroup key={area}>
              <SelectLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                {area}
              </SelectLabel>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
