"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight, Calendar, Package } from "lucide-react"
import { SeasonalBanner } from "@/components/wolverine/seasonal-banner"
import { ItemCard } from "@/components/wolverine/item-card"
import { TrustIndicators } from "@/components/wolverine/trust-indicators"
import { categories } from "@/lib/data"
import { useListings } from "@/lib/listings-context"

export default function HomePage() {
  const { getAllListings } = useListings()
  const allListings = getAllListings()

  const featuredItems = allListings.slice(0, 6).map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    price: l.price,
    condition: l.condition,
    category: l.category,
    images: l.images,
    sellerId: l.sellerId,
    sellerName: l.sellerName,
    pickupLocation: l.pickupLocation,
    preBookAvailable: l.preBookAvailable,
    createdAt: l.createdAt,
  }))

  const preBookItems = allListings
    .filter((l) => l.preBookAvailable)
    .slice(0, 4)
    .map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.price,
      condition: l.condition,
      category: l.category,
      images: l.images,
      sellerId: l.sellerId,
      sellerName: l.sellerName,
      pickupLocation: l.pickupLocation,
      preBookAvailable: l.preBookAvailable,
      createdAt: l.createdAt,
    }))

  return (
    <div className="flex flex-col">
      {/* Hero Section with Seasonal Banner */}
      <SeasonalBanner />

      {/* Search Section */}
      <section className="py-8 sm:py-12 px-4 -mt-8 relative z-10">
        <div className="mx-auto max-w-2xl">
          <div className="bg-card rounded-xl shadow-lg p-4 sm:p-6">
            <form action="/browse" method="get" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  name="q"
                  placeholder="Search for furniture, textbooks, electronics..."
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Search
              </Button>
            </form>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((category) => (
                <Link key={category} href={`/browse?category=${encodeURIComponent(category)}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-maize hover:text-maize-foreground transition-colors px-3 py-1.5"
                  >
                    {category}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-8 sm:py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Listings</h2>
            <Button variant="ghost" asChild className="group">
              <Link href="/browse">
                View all
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to list an item for Michigan students!
              </p>
              <Button asChild>
                <Link href="/sell">Start Selling</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Pre-book Section */}
      <section className="py-8 sm:py-12 px-4 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start sm:items-center justify-between mb-6 flex-col sm:flex-row gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-maize" />
                <h2 className="text-2xl font-bold">Pre-book Available</h2>
              </div>
              <p className="text-muted-foreground">
                Reserve items now, pick up during move-in week
              </p>
            </div>
            <Button variant="outline" asChild className="group">
              <Link href="/browse?prebook=true">
                Browse pre-book items
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {preBookItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {preBookItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No pre-book items available yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-balance">
            Ready to declutter before graduation?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            List your items in minutes and reach thousands of verified Michigan students looking for great deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-maize text-maize-foreground hover:bg-maize/90">
              <Link href="/sell">Start Selling</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/browse">Browse Items</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
