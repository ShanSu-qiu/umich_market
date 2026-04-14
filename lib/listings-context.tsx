"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

export type Listing = {
  id: string
  title: string
  description: string
  price: number
  condition: string
  category: string
  images: string[]
  sellerId: string
  sellerName: string
  sellerEmail: string
  pickupLocation: string
  preBookAvailable: boolean
  createdAt: string
  status: "Active" | "Pre-booked" | "Sold"
}

type ListingsContextType = {
  listings: Listing[]
  addListing: (listing: Omit<Listing, "id" | "createdAt" | "status">) => Listing
  updateListing: (id: string, data: Partial<Omit<Listing, "id" | "createdAt" | "sellerEmail" | "sellerId">>) => boolean
  getListingById: (id: string) => Listing | undefined
  getMyListings: (email: string) => Listing[]
  getAllListings: () => Listing[]
}

const ListingsContext = createContext<ListingsContextType>({
  listings: [],
  addListing: () => ({ id: "", createdAt: "", status: "Active" } as Listing),
  updateListing: () => false,
  getListingById: () => undefined,
  getMyListings: () => [],
  getAllListings: () => [],
})

const STORAGE_KEY = "wolverine_market_listings"

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: Listing[] = JSON.parse(stored)
        // Clean out listings with dead blob: URLs
        const valid = parsed.map((l) => ({
          ...l,
          images: l.images.filter((url) => !url.startsWith("blob:")),
        })).filter((l) => l.images.length > 0)
        setListings(valid)
      }
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
      } catch (e) {
        console.error("Failed to save listings to localStorage (likely exceeded size limit):", e)
      }
    }
  }, [listings, loaded])

  const addListing = useCallback((data: Omit<Listing, "id" | "createdAt" | "status">) => {
    const newListing: Listing = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "Active",
    }
    setListings((prev) => [newListing, ...prev])
    return newListing
  }, [])

  const updateListing = useCallback((id: string, data: Partial<Omit<Listing, "id" | "createdAt" | "sellerEmail" | "sellerId">>) => {
    let found = false
    setListings((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          found = true
          return { ...l, ...data }
        }
        return l
      })
    )
    return found
  }, [])

  const getListingById = useCallback((id: string) => {
    return listings.find((l) => l.id === id)
  }, [listings])

  const getMyListings = useCallback((email: string) => {
    return listings.filter((l) => l.sellerEmail === email)
  }, [listings])

  const getAllListings = useCallback(() => {
    return listings
  }, [listings])

  return (
    <ListingsContext.Provider value={{ listings, addListing, updateListing, getListingById, getMyListings, getAllListings }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  return useContext(ListingsContext)
}
