import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreditScoreBadgeProps {
  rating: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function CreditScoreBadge({ rating, size = "md", showLabel = false }: CreditScoreBadgeProps) {
  const sizeClasses = {
    sm: "text-xs gap-0.5",
    md: "text-sm gap-1",
    lg: "text-base gap-1.5",
  }
  
  const starSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }
  
  return (
    <div className={cn("flex items-center", sizeClasses[size])}>
      <Star className={cn("fill-maize text-maize", starSizes[size])} />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      {showLabel && <span className="text-muted-foreground">/5</span>}
    </div>
  )
}
