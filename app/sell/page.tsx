"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useListings } from "@/lib/listings-context"
import { ListingForm, type ListingFormData } from "@/components/wolverine/listing-form"

export default function SellPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addListing } = useListings()

  const handleSubmit = (data: ListingFormData) => {
    if (!user) {
      router.push("/login")
      return
    }

    addListing({
      title: data.title,
      description: data.description,
      price: Number(data.price),
      condition: data.condition,
      category: data.category,
      images: data.photos.map((p) => p.previewUrl),
      sellerId: user.email,
      sellerName: user.name,
      sellerEmail: user.email,
      pickupLocation: data.pickupLocation,
      preBookAvailable: data.enablePrebook,
    })

    router.push("/dashboard")
  }

  return (
    <ListingForm
      heading="List an Item"
      subtitle="Reach thousands of verified Michigan students"
      submitLabel="Publish Listing"
      onSubmit={handleSubmit}
    />
  )
}
