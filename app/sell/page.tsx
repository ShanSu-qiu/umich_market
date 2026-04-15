"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useListings } from "@/lib/listings-context"
import { uploadListingImages } from "@/lib/supabase/storage"
import { ListingForm, type ListingFormData } from "@/components/wolverine/listing-form"

const DRAFT_KEY = "sell_draft"

export default function SellPage() {
  const { user } = useAuth()
  const { addListing } = useListings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [draftRestored, setDraftRestored] = useState(false)
  const [initialData, setInitialData] = useState<ListingFormData | undefined>(undefined)
  const [formKey, setFormKey] = useState(0)

  // Restore draft after mount (client-only)
  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return

    try {
      const saved = JSON.parse(raw)
      setInitialData({
        title: saved.title || "",
        description: saved.description || "",
        price: saved.price || "",
        category: saved.category || "",
        condition: saved.condition || "",
        pickupLocation: saved.pickupLocation || "",
        enablePrebook: saved.enablePrebook || false,
        photos: [],
      })
      sessionStorage.removeItem(DRAFT_KEY)
      setDraftRestored(true)
      setFormKey((k) => k + 1) // Force ListingForm to re-mount with new initialData
    } catch {
      sessionStorage.removeItem(DRAFT_KEY)
    }
  }, [])

  const handleSubmit = async (data: ListingFormData) => {
    if (!user) {
      // Save draft before redirecting to login
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        pickupLocation: data.pickupLocation,
        enablePrebook: data.enablePrebook,
      }))
      window.location.href = "/login?redirect=/sell"
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const files = data.photos.map((p) => p.file)
      const uploadedUrls = await uploadListingImages(files, user.id)

      const existingUrls = data.photos
        .filter((p) => !p.file && p.previewUrl)
        .map((p) => p.previewUrl)
      const imageUrls = [...uploadedUrls, ...existingUrls]

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

      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Failed to create listing:", err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {draftRestored && (
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200">
            Your draft was restored. Please re-add your photos.
          </div>
        </div>
      )}
      {error && (
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}
      <ListingForm
        key={formKey}
        heading="List an Item"
        subtitle="Reach thousands of verified Michigan students"
        submitLabel={isSubmitting ? "Publishing..." : "Publish Listing"}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
