"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useListings } from "@/lib/listings-context"
import { uploadListingImage } from "@/lib/supabase/storage"
import { ListingForm, type ListingFormData } from "@/components/wolverine/listing-form"

export default function SellPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addListing } = useListings()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: ListingFormData) => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      // Upload photos to Supabase Storage
      const imageUrls: string[] = []
      for (const photo of data.photos) {
        if (photo.file) {
          const url = await uploadListingImage(photo.file, user.id)
          imageUrls.push(url)
        }
      }

      await addListing({
        title: data.title,
        description: data.description,
        price: Number(data.price),
        condition: data.condition,
        category: data.category,
        images: imageUrls,
        pickupLocation: data.pickupLocation,
        preBookAvailable: data.enablePrebook,
      })

      router.push("/dashboard")
    } catch (err) {
      console.error("Failed to create listing:", err)
      setIsSubmitting(false)
    }
  }

  return (
    <ListingForm
      heading="List an Item"
      subtitle="Reach thousands of verified Michigan students"
      submitLabel={isSubmitting ? "Publishing..." : "Publish Listing"}
      onSubmit={handleSubmit}
    />
  )
}
