"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useListings } from "@/lib/listings-context"
import { uploadListingImage } from "@/lib/supabase/storage"
import { ListingForm, type ListingFormData } from "@/components/wolverine/listing-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, LogIn } from "lucide-react"

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { getListingById, updateListing } = useListings()

  const listingId = params.id as string
  const listing = getListingById(listingId)

  if (authLoading) {
    return (
      <div className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-72 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4">
          <Card>
            <CardContent className="py-16 text-center">
              <LogIn className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Sign in required</h2>
              <p className="text-muted-foreground mb-6">You need to sign in to edit listings.</p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Listing not found</h2>
              <p className="text-muted-foreground mb-6">This listing may have been deleted.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Authorization: only the seller can edit
  if (listing.sellerId !== user.id) {
    return (
      <div className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-bold mb-2">Unauthorized</h2>
              <p className="text-muted-foreground mb-6">You can only edit your own listings.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Sold listings cannot be edited
  if (listing.status === "Sold") {
    return (
      <div className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Cannot edit sold listing</h2>
              <p className="text-muted-foreground mb-6">Sold listings cannot be modified.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const initialData: ListingFormData = {
    title: listing.title,
    description: listing.description,
    category: listing.category,
    condition: listing.condition,
    price: String(listing.price),
    enablePrebook: listing.preBookAvailable,
    pickupLocation: listing.pickupLocation,
    photos: listing.images.map((url) => ({ file: null, previewUrl: url })),
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: ListingFormData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      // Upload new photos (those with a File), keep existing URLs
      const imageUrls: string[] = []
      for (const photo of data.photos) {
        if (photo.file) {
          const url = await uploadListingImage(photo.file, user.id)
          imageUrls.push(url)
        } else {
          imageUrls.push(photo.previewUrl)
        }
      }

      await updateListing(listingId, {
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
      console.error("Failed to update listing:", err)
      setIsSubmitting(false)
    }
  }

  return (
    <ListingForm
      heading="Edit Listing"
      subtitle={`Editing "${listing.title}"`}
      submitLabel={isSubmitting ? "Saving..." : "Save Changes"}
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  )
}
