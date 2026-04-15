"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useListings } from "@/lib/listings-context"
import { uploadListingImages } from "@/lib/supabase/storage"
import { ListingForm, type ListingFormData } from "@/components/wolverine/listing-form"

const DRAFT_KEY = "sell_draft"

// Compress a blob URL or data URL to a small JPEG data URL for sessionStorage
function compressToDataUrl(src: string, maxWidth = 400, quality = 0.5): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      canvas.width = width
      canvas.height = height
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }
    img.onerror = () => resolve("")
    img.src = src
  })
}

// Convert a data URL back to a File for upload
function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",")
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg"
  const bstr = atob(arr[1])
  const u8arr = new Uint8Array(bstr.length)
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i)
  return new File([u8arr], filename, { type: mime })
}

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
      const restoredPhotos = (saved.photoDataUrls || [])
        .filter((url: string) => url)
        .map((url: string, i: number) => ({
          file: dataUrlToFile(url, `restored-${i}.jpg`),
          previewUrl: url,
        }))

      setInitialData({
        title: saved.title || "",
        description: saved.description || "",
        price: saved.price || "",
        category: saved.category || "",
        condition: saved.condition || "",
        pickupLocation: saved.pickupLocation || "",
        enablePrebook: saved.enablePrebook || false,
        photos: restoredPhotos,
      })
      sessionStorage.removeItem(DRAFT_KEY)
      setDraftRestored(true)
      setFormKey((k) => k + 1)
    } catch {
      sessionStorage.removeItem(DRAFT_KEY)
    }
  }, [])

  const handleSubmit = async (data: ListingFormData) => {
    if (!user) {
      // Compress photos to small data URLs for sessionStorage
      const photoDataUrls: string[] = []
      for (const photo of data.photos) {
        if (photo.previewUrl) {
          const compressed = await compressToDataUrl(photo.previewUrl)
          if (compressed) photoDataUrls.push(compressed)
        }
      }

      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        pickupLocation: data.pickupLocation,
        enablePrebook: data.enablePrebook,
        photoDataUrls,
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
        .filter((p) => !p.file && p.previewUrl && !p.previewUrl.startsWith("data:"))
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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200">
            Your draft and photos were restored successfully.
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
