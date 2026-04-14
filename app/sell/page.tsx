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
  const [error, setError] = useState("")

  const handleSubmit = async (data: ListingFormData) => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Upload photos to Supabase Storage
      const imageUrls: string[] = []
      for (const photo of data.photos) {
        if (photo.file) {
          const url = await uploadListingImage(photo.file, user.id)
          imageUrls.push(url)
        } else if (photo.previewUrl) {
          // Existing URL (e.g. from edit)
          imageUrls.push(photo.previewUrl)
        }
      }

      if (imageUrls.length === 0) {
        setError("Please upload at least one photo")
        setIsSubmitting(false)
        return
      }

      const result = await addListing({
        title: data.title,
        description: data.description,
        price: Number(data.price),
        condition: data.condition,
        category: data.category,
        images: imageUrls,
        pickupLocation: data.pickupLocation,
        preBookAvailable: data.enablePrebook,
      })

      if (!result) {
        setError("Failed to create listing. Please try again.")
        setIsSubmitting(false)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Failed to create listing:", err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}
      <ListingForm
        heading="List an Item"
        subtitle="Reach thousands of verified Michigan students"
        submitLabel={isSubmitting ? "Publishing..." : "Publish Listing"}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
