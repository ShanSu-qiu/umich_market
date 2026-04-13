"use client"

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pickupLocations } from "@/lib/data"

interface CampusLocationPickerProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}

export function CampusLocationPicker({ value, onValueChange, placeholder = "Select pickup location" }: CampusLocationPickerProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
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
  )
}
