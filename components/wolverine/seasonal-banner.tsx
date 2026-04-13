"use client"

import { GraduationCap, Sparkles, ShoppingBag } from "lucide-react"
import { getSeasonalMessage } from "@/lib/data"

export function SeasonalBanner() {
  const message = getSeasonalMessage()
  
  const icons = {
    graduation: GraduationCap,
    movein: ShoppingBag,
    normal: Sparkles,
  }
  
  const Icon = icons[message.type]
  
  return (
    <div className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="relative px-4 py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-maize/20 px-4 py-2 mb-6">
            <Icon className="w-5 h-5 text-maize" />
            <span className="text-sm font-medium text-maize">
              {message.type === "graduation" ? "Graduation Season" : message.type === "movein" ? "Move-in Season" : "Campus Marketplace"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
            {message.title}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-primary-foreground/80 text-pretty max-w-2xl mx-auto">
            {message.subtitle}
          </p>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-maize/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-maize/10 blur-3xl" />
    </div>
  )
}
