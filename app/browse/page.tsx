"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, X, Star } from "lucide-react"
import { ItemCard } from "@/components/wolverine/item-card"
import { categories, type Item } from "@/lib/data"

const conditions = ["New", "Like New", "Good", "Fair"]
const pickupAreas = ["Central Campus", "North Campus", "Off-campus"]
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
]

function BrowsePageContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || ""
  const initialQuery = searchParams.get("q") || ""
  const initialPrebook = searchParams.get("prebook") === "true"
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 200])
  const [preBookOnly, setPreBookOnly] = useState(initialPrebook)
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState("newest")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
  // TODO: Replace with real data fetching
  const allItems: Item[] = []

  const filteredItems = useMemo(() => {
    let items = [...allItems]
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      )
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      items = items.filter((item) => selectedCategories.includes(item.category))
    }
    
    // Condition filter
    if (selectedConditions.length > 0) {
      items = items.filter((item) => selectedConditions.includes(item.condition))
    }
    
    // Area filter
    if (selectedAreas.length > 0) {
      items = items.filter((item) => selectedAreas.includes(item.pickupArea))
    }
    
    // Price filter
    items = items.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    )
    
    // Pre-book filter
    if (preBookOnly) {
      items = items.filter((item) => item.preBookAvailable)
    }
    
    // Rating filter
    if (minRating > 0) {
      items = items.filter((item) => item.sellerRating >= minRating)
    }
    
    // Sort
    switch (sortBy) {
      case "price-low":
        items.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        items.sort((a, b) => b.price - a.price)
        break
      case "popular":
        items.sort((a, b) => b.sellerTransactions - a.sellerTransactions)
        break
      default:
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    
    return items
  }, [searchQuery, selectedCategories, selectedConditions, selectedAreas, priceRange, preBookOnly, minRating, sortBy])
  
  const activeFilterCount = 
    selectedCategories.length + 
    selectedConditions.length + 
    selectedAreas.length + 
    (preBookOnly ? 1 : 0) + 
    (minRating > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0)
  
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedConditions([])
    setSelectedAreas([])
    setPriceRange([0, 200])
    setPreBookOnly(false)
    setMinRating(0)
  }
  
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }
  
  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    )
  }
  
  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }
  
  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Price Range</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={200}
          step={5}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
      </div>
      
      {/* Categories */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Category</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Condition */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Condition</Label>
        <div className="space-y-2">
          {conditions.map((condition) => (
            <div key={condition} className="flex items-center gap-2">
              <Checkbox
                id={`condition-${condition}`}
                checked={selectedConditions.includes(condition)}
                onCheckedChange={() => toggleCondition(condition)}
              />
              <Label htmlFor={`condition-${condition}`} className="text-sm cursor-pointer">
                {condition}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pickup Location */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Pickup Location</Label>
        <div className="space-y-2">
          {pickupAreas.map((area) => (
            <div key={area} className="flex items-center gap-2">
              <Checkbox
                id={`area-${area}`}
                checked={selectedAreas.includes(area)}
                onCheckedChange={() => toggleArea(area)}
              />
              <Label htmlFor={`area-${area}`} className="text-sm cursor-pointer">
                {area}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pre-booking */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="prebook"
          checked={preBookOnly}
          onCheckedChange={(checked) => setPreBookOnly(checked === true)}
        />
        <Label htmlFor="prebook" className="text-sm cursor-pointer">
          Available for Pre-booking
        </Label>
      </div>
      
      {/* Seller Rating */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Minimum Seller Rating</Label>
        <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any rating</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
            <SelectItem value="4.8">4.8+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  )
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b sticky top-16 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-44 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" className="h-11 relative">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-maize text-maize-foreground">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="gap-1">
                  {cat}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
                </Badge>
              ))}
              {selectedConditions.map((cond) => (
                <Badge key={cond} variant="secondary" className="gap-1">
                  {cond}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCondition(cond)} />
                </Badge>
              ))}
              {selectedAreas.map((area) => (
                <Badge key={area} variant="secondary" className="gap-1">
                  {area}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArea(area)} />
                </Badge>
              ))}
              {preBookOnly && (
                <Badge variant="secondary" className="gap-1">
                  Pre-book Available
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setPreBookOnly(false)} />
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="w-3 h-3" /> {minRating}+
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-36">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              <FiltersContent />
            </div>
          </aside>
          
          {/* Results */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
            </p>
            
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BrowseLoadingFallback() {
  return (
    <div className="min-h-screen">
      <div className="bg-card border-b sticky top-16 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 h-11 bg-muted rounded-md animate-pulse" />
            <div className="w-full sm:w-44 h-11 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="h-6 w-20 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </aside>
          <div className="flex-1">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoadingFallback />}>
      <BrowsePageContent />
    </Suspense>
  )
}
