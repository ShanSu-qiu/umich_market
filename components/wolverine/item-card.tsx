"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar } from "lucide-react"
import type { Item } from "@/lib/data"

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/item/${item.id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.images[0]}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          {item.preBookAvailable && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-maize text-maize-foreground font-medium">
                <Calendar className="w-3 h-3 mr-1" />
                Pre-book
              </Badge>
            </div>
          )}
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm"
          >
            {item.condition}
          </Badge>
        </div>
        <CardContent className="p-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-lg font-bold text-primary">${item.price}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{item.sellerName}</span>
              {item.sellerRating != null && (
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-maize text-maize" />
                  {item.sellerRating}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{item.pickupLocation}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
