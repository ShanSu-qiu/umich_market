"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useAuth } from "@/lib/auth-context"

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
  isLoading: boolean
  addListing: (data: {
    title: string
    description: string
    price: number
    condition: string
    category: string
    images: string[]
    pickupLocation: string
    preBookAvailable: boolean
  }) => Promise<Listing | null>
  updateListing: (id: string, data: Partial<{
    title: string
    description: string
    price: number
    condition: string
    category: string
    images: string[]
    pickupLocation: string
    preBookAvailable: boolean
  }>) => Promise<boolean>
  getListingById: (id: string) => Listing | undefined
  getMyListings: () => Listing[]
  getAllListings: () => Listing[]
  refreshListings: () => Promise<void>
}

const ListingsContext = createContext<ListingsContextType>({
  listings: [],
  isLoading: true,
  addListing: async () => null,
  updateListing: async () => false,
  getListingById: () => undefined,
  getMyListings: () => [],
  getAllListings: () => [],
  refreshListings: async () => {},
})

// Map a Supabase row (with joined profile) to our Listing type
function mapRow(row: Record<string, unknown>): Listing {
  const profile = row.profiles as Record<string, unknown> | null
  const statusMap: Record<string, Listing["status"]> = {
    active: "Active",
    reserved: "Pre-booked",
    sold: "Sold",
  }
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    price: Number(row.price),
    condition: (row.condition as string) || "",
    category: (row.category as string) || "",
    images: (row.images as string[]) || [],
    sellerId: row.seller_id as string,
    sellerName: profile?.display_name as string || profile?.email as string || "Unknown",
    sellerEmail: profile?.email as string || "",
    pickupLocation: (row.pickup_location as string) || "",
    preBookAvailable: (row.pre_booking_enabled as boolean) || false,
    createdAt: row.created_at as string,
    status: statusMap[row.status as string] || "Active",
  }
}

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const clientRef = useRef<SupabaseClient | null>(null)

  const getSupabase = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = createClient()
    }
    return clientRef.current
  }, [])

  const fetchListings = useCallback(async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("listings")
      .select("*, profiles(display_name, email)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch listings:", error)
      setIsLoading(false)
      return
    }

    setListings((data || []).map(mapRow))
    setIsLoading(false)
  }, [getSupabase])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const addListing = useCallback(async (data: {
    title: string
    description: string
    price: number
    condition: string
    category: string
    images: string[]
    pickupLocation: string
    preBookAvailable: boolean
  }): Promise<Listing | null> => {
    if (!user) return null

    const supabase = getSupabase()
    const { data: row, error } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        title: data.title,
        description: data.description,
        price: data.price,
        condition: data.condition,
        category: data.category,
        images: data.images,
        pickup_location: data.pickupLocation,
        pre_booking_enabled: data.preBookAvailable,
      })
      .select("*, profiles(display_name, email)")
      .single()

    if (error) {
      console.error("Failed to add listing:", error)
      return null
    }

    const newListing = mapRow(row)
    setListings((prev) => [newListing, ...prev])
    return newListing
  }, [getSupabase, user])

  const updateListing = useCallback(async (id: string, data: Partial<{
    title: string
    description: string
    price: number
    condition: string
    category: string
    images: string[]
    pickupLocation: string
    preBookAvailable: boolean
  }>): Promise<boolean> => {
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = data.price
    if (data.condition !== undefined) updateData.condition = data.condition
    if (data.category !== undefined) updateData.category = data.category
    if (data.images !== undefined) updateData.images = data.images
    if (data.pickupLocation !== undefined) updateData.pickup_location = data.pickupLocation
    if (data.preBookAvailable !== undefined) updateData.pre_booking_enabled = data.preBookAvailable
    updateData.updated_at = new Date().toISOString()

    const supabase = getSupabase()
    const { data: row, error } = await supabase
      .from("listings")
      .update(updateData)
      .eq("id", id)
      .select("*, profiles(display_name, email)")
      .single()

    if (error) {
      console.error("Failed to update listing:", error)
      return false
    }

    const updated = mapRow(row)
    setListings((prev) => prev.map((l) => (l.id === id ? updated : l)))
    return true
  }, [getSupabase])

  const getListingById = useCallback((id: string) => {
    return listings.find((l) => l.id === id)
  }, [listings])

  const getMyListings = useCallback(() => {
    if (!user) return []
    return listings.filter((l) => l.sellerId === user.id)
  }, [listings, user])

  const getAllListings = useCallback(() => {
    return listings
  }, [listings])

  return (
    <ListingsContext.Provider value={{
      listings,
      isLoading,
      addListing,
      updateListing,
      getListingById,
      getMyListings,
      getAllListings,
      refreshListings: fetchListings,
    }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  return useContext(ListingsContext)
}
