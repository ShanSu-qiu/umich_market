import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PreBookBadgeProps {
  className?: string
  size?: "sm" | "md"
}

export function PreBookBadge({ className, size = "md" }: PreBookBadgeProps) {
  return (
    <Badge 
      className={cn(
        "bg-maize text-maize-foreground hover:bg-maize/90 font-medium",
        size === "sm" && "text-xs px-2 py-0.5",
        className
      )}
    >
      <Calendar className={cn("mr-1", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      Pre-book Available
    </Badge>
  )
}
