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
  getMyListings: (email: string) => Listing[]
  getAllListings: () => Listing[]
}

const ListingsContext = createContext<ListingsContextType>({
  listings: [],
  addListing: () => ({ id: "", createdAt: "", status: "Active" } as Listing),
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
        setListings(JSON.parse(stored))
      }
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
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

  const getMyListings = useCallback((email: string) => {
    return listings.filter((l) => l.sellerEmail === email)
  }, [listings])

  const getAllListings = useCallback(() => {
    return listings
  }, [listings])

  return (
    <ListingsContext.Provider value={{ listings, addListing, getMyListings, getAllListings }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  return useContext(ListingsContext)
}
