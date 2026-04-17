"use client"

import { useState } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  MessageCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2
} from "lucide-react"
import { PreBookBadge } from "@/components/wolverine/pre-book-badge"
import { ItemCard } from "@/components/wolverine/item-card"
import { ChatModal } from "@/components/wolverine/chat-modal"
import { useListings } from "@/lib/listings-context"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"


export default function ItemDetailPage() {
  const params = useParams()
  const { getListingById, getAllListings } = useListings()

  const listing = getListingById(params.id as string)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [preBookDate, setPreBookDate] = useState<Date | undefined>()
  const [preBookNotes, setPreBookNotes] = useState("")
  const [preBookOpen, setPreBookOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const { user } = useAuth()

  if (!listing) {
    notFound()
  }

  const similarItems = getAllListings()
    .filter((l) => l.id !== listing.id && l.category === listing.category)
    .slice(0, 4)
    .map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.price,
      condition: l.condition,
      category: l.category,
      images: l.images,
      sellerId: l.sellerId,
      sellerName: l.sellerName,
      pickupLocation: l.pickupLocation,
      preBookAvailable: l.preBookAvailable,
      createdAt: l.createdAt,
    }))

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
  }

  const [preBookSending, setPreBookSending] = useState(false)
  const [preBookSuccess, setPreBookSuccess] = useState(false)
  const [existingBooking, setExistingBooking] = useState<{ id: string; pickup_date: string } | null>(null)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)

  const getSupabase = () => createClient()

  const submitBooking = async (mode: "new" | "replace", existingId?: string) => {
    if (!user || !preBookDate) return

    setPreBookSending(true)
    setShowReplaceConfirm(false)
    try {
      const supabase = getSupabase()

      if (mode === "replace" && existingId) {
        // Update existing booking
        const { error } = await supabase.from("bookings").update({
          pickup_date: preBookDate.toISOString().split("T")[0],
          notes: preBookNotes || null,
          status: "pending",
        }).eq("id", existingId)

        if (error) {
          console.error("Failed to update booking:", error)
          alert("Failed to update pre-booking. Please try again.")
          return
        }

        // Notify seller of reschedule
        await supabase.from("notifications").insert({
          user_id: listing.sellerId,
          type: "booking_reschedule",
          title: "Pickup Date Change Request",
          message: `${user.name} wants to change their pickup for "${listing.title}" to ${preBookDate.toLocaleDateString()}.`,
          listing_id: listing.id,
        })
      } else {
        // Create new booking
        const { error } = await supabase.from("bookings").insert({
          listing_id: listing.id,
          buyer_id: user.id,
          pickup_date: preBookDate.toISOString().split("T")[0],
          notes: preBookNotes || null,
          status: "pending",
        })

        if (error) {
          console.error("Failed to create booking:", error)
          alert("Failed to submit pre-booking. Please try again.")
          return
        }

        // Notify seller
        await supabase.from("notifications").insert({
          user_id: listing.sellerId,
          type: "prebooking_received",
          title: "New Pre-booking Request",
          message: `${user.name} has pre-booked "${listing.title}" for pickup on ${preBookDate.toLocaleDateString()}.`,
          listing_id: listing.id,
        })
      }

      // Send email notification
      fetch("/api/messages/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerEmail: listing.sellerEmail,
          sellerName: listing.sellerName,
          buyerName: user.name,
          listingTitle: listing.title,
          messageContent: mode === "replace"
            ? `Pickup date change request to ${preBookDate.toLocaleDateString()}.`
            : `Pre-booking request for pickup on ${preBookDate.toLocaleDateString()}.`,
        }),
      }).catch(() => {})

      setPreBookSuccess(true)
      setTimeout(() => {
        setPreBookOpen(false)
        setPreBookSuccess(false)
        setPreBookDate(undefined)
        setPreBookNotes("")
        setExistingBooking(null)
      }, 2000)
    } catch (err) {
      console.error("Pre-booking failed:", err)
      alert("Something went wrong. Please try again.")
    } finally {
      setPreBookSending(false)
    }
  }

  const handlePreBook = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/item/${listing.id}`
      return
    }
    if (!preBookDate) return

    const supabase = getSupabase()

    // Check for existing active booking
    const { data: existingRows, error: checkError } = await supabase
      .from("bookings")
      .select("id, pickup_date")
      .eq("listing_id", listing.id)
      .eq("buyer_id", user.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1)

    if (checkError) {
      console.error("Failed to check existing booking:", checkError)
    }

    const existing = existingRows?.[0] ?? null

    if (existing) {
      setExistingBooking(existing)
      setShowReplaceConfirm(true)
      return
    }

    await submitBooking("new")
  }

  const openChat = () => {
    if (!user) {
      window.location.href = `/login?redirect=/item/${listing.id}`
      return
    }
    setChatOpen(true)
  }

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/browse" className="hover:text-foreground transition-colors">
            Browse
          </Link>
          <span>/</span>
          <Link
            href={`/browse?category=${encodeURIComponent(listing.category)}`}
            className="hover:text-foreground transition-colors"
          >
            {listing.category}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {listing.preBookAvailable && <PreBookBadge />}
              </div>
              <Badge variant="secondary" className="absolute top-4 right-4">
                {listing.condition}
              </Badge>
            </div>

            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? "border-primary" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-balance">{listing.title}</h1>
              <p className="text-3xl sm:text-4xl font-bold text-primary">${listing.price}</p>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* Pickup Location */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{listing.pickupLocation}</p>
              </div>
            </div>

            {/* Seller Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {listing.sellerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{listing.sellerName}</p>
                    <p className="text-sm text-muted-foreground">{listing.sellerEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" size="lg" onClick={openChat}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message Seller
              </Button>

              <ChatModal
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                listingId={listing.id}
                listingTitle={listing.title}
                sellerId={listing.sellerId}
                sellerName={listing.sellerName}
                sellerEmail={listing.sellerEmail}
              />

              {listing.preBookAvailable ? (
                <Dialog open={preBookOpen} onOpenChange={setPreBookOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-maize text-maize-foreground hover:bg-maize/90" size="lg">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Pre-book for Pickup
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Pre-book This Item</DialogTitle>
                      <DialogDescription>
                        Select a pickup date and add any notes for the seller.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Select Pickup Date</Label>
                        <Calendar
                          mode="single"
                          selected={preBookDate}
                          onSelect={setPreBookDate}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border mx-auto"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes for Seller (optional)</Label>
                        <Textarea
                          placeholder="e.g., I'll be moving in during the morning, flexible on exact time..."
                          value={preBookNotes}
                          onChange={(e) => setPreBookNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>Item will be reserved for you</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>Coordinate pickup details with seller</span>
                        </div>
                      </div>
                    </div>
                    {showReplaceConfirm && existingBooking && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                        <p className="text-amber-800">
                          You already have a pre-booking for this item on{" "}
                          <strong>{new Date(existingBooking.pickup_date).toLocaleDateString()}</strong>.
                          {preBookDate && (
                            <> Replace with <strong>{preBookDate.toLocaleDateString()}</strong>?</>
                          )}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => submitBooking("replace", existingBooking.id)}
                            disabled={preBookSending}
                          >
                            {preBookSending ? "Updating..." : "Yes, Replace"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowReplaceConfirm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    {preBookSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                        {existingBooking ? "Pre-booking updated! The seller will be notified." : "Pre-booking submitted! The seller will be notified."}
                      </div>
                    )}
                    {!showReplaceConfirm && (
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPreBookOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePreBook}
                          disabled={!preBookDate || preBookSending || preBookSuccess}
                          className="bg-maize text-maize-foreground hover:bg-maize/90"
                        >
                          {preBookSending ? "Submitting..." : preBookSuccess ? "Submitted!" : "Confirm Pre-booking"}
                        </Button>
                      </DialogFooter>
                    )}
                  </DialogContent>
                </Dialog>
              ) : (
                <Button className="flex-1" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Request to Buy
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Similar Items */}
        {similarItems.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-bold mb-6">Similar Items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.map((similarItem) => (
                <ItemCard key={similarItem.id} item={similarItem} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
