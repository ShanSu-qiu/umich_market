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
  const [messageOpen, setMessageOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messageSent, setMessageSent] = useState(false)
  const [messageSending, setMessageSending] = useState(false)
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

  const handlePreBook = () => {
    alert(`Pre-booking submitted for ${preBookDate?.toLocaleDateString()}!\nNotes: ${preBookNotes}`)
    setPreBookOpen(false)
    setPreBookDate(undefined)
    setPreBookNotes("")
  }

  const handleMessage = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/item/${listing.id}`
      return
    }

    setMessageSending(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from("messages").insert({
        listing_id: listing.id,
        sender_id: user.id,
        receiver_id: listing.sellerId,
        content: message,
      })

      if (error) {
        console.error("Failed to send message:", error)
        alert("Failed to send message. Please try again.")
        return
      }

      // Send email notification
      await fetch("/api/messages/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerEmail: listing.sellerEmail,
          sellerName: listing.sellerName,
          buyerName: user.name,
          listingTitle: listing.title,
          messageContent: message,
        }),
      }).catch(() => {}) // Don't block on email failure

      setMessageSent(true)
      setMessage("")
      setTimeout(() => {
        setMessageOpen(false)
        setMessageSent(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to send message:", err)
      alert("Something went wrong. Please try again.")
    } finally {
      setMessageSending(false)
    }
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
              <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1" size="lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Seller
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Message {listing.sellerName}</DialogTitle>
                    <DialogDescription>
                      Send a message about this item. The seller will be notified via email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Your Message</Label>
                      <Textarea
                        placeholder={`Hi! I'm interested in "${listing.title}"...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  {messageSent && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      Message sent successfully!
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMessageOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleMessage} disabled={!message.trim() || messageSending || messageSent}>
                      {messageSending ? "Sending..." : messageSent ? "Sent!" : "Send Message"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPreBookOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePreBook}
                        disabled={!preBookDate}
                        className="bg-maize text-maize-foreground hover:bg-maize/90"
                      >
                        Confirm Pre-booking
                      </Button>
                    </DialogFooter>
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
