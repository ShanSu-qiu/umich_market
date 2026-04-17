"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  ShoppingBag,
  Calendar,
  Star,
  Plus,
  LogIn,
  Pencil,
  Trash2,
  MessageCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useListings } from "@/lib/listings-context"
import { createClient } from "@/lib/supabase/client"
import { ChatModal } from "@/components/wolverine/chat-modal"

type Conversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  listing: { title: string; images: string[] } | null
  buyer: { display_name: string; email: string } | null
  seller: { display_name: string; email: string } | null
  messages: { content: string; created_at: string; read: boolean; sender_id: string; receiver_id: string }[]
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("listings")
  const { user, isLoading } = useAuth()
  const { getMyListings, deleteListing } = useListings()
  const myListings = getMyListings()
  const activeCount = myListings.filter((l) => l.status === "Active").length
  const supabase = useMemo(() => createClient(), [])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convsLoading, setConvsLoading] = useState(true)
  const [openChatConv, setOpenChatConv] = useState<Conversation | null>(null)
  const [bookings, setBookings] = useState<Array<{
    id: string; listing_id: string; buyer_id: string; pickup_date: string; notes: string | null; status: string; created_at: string;
    listing: { title: string } | null; buyer: { display_name: string; email: string } | null
  }>>([])
  const [notifications, setNotifications] = useState<Array<{
    id: string; type: string; title: string; message: string; listing_id: string | null; is_read: boolean; created_at: string
  }>>([])

  const unreadCount = conversations.reduce((count, conv) => {
    return count + conv.messages.filter((m) => !m.read && m.receiver_id === user?.id).length
  }, 0)
  const unreadNotifs = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    if (!user) return

    // Fetch conversations
    supabase
      .from("conversations")
      .select(`*, listing:listings(title, images), buyer:profiles!buyer_id(display_name, email), seller:profiles!seller_id(display_name, email), messages(content, created_at, read, sender_id, receiver_id)`)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setConversations((data as Conversation[]) || [])
        setConvsLoading(false)
      })

    // Fetch bookings (where user is seller)
    supabase
      .from("bookings")
      .select("*, listing:listings(title), buyer:profiles!buyer_id(display_name, email)")
      .in("listing_id", myListings.map((l) => l.id).length > 0 ? myListings.map((l) => l.id) : ["00000000-0000-0000-0000-000000000000"])
      .order("created_at", { ascending: false })
      .then(({ data }) => setBookings(data || []))

    // Fetch notifications
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications(data || []))
  }, [user, supabase, myListings])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
      case "Pre-booked":
        return <Badge className="bg-maize/20 text-maize-foreground hover:bg-maize/20">Pre-booked</Badge>
      case "Sold":
        return <Badge variant="secondary">Sold</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>
      case "Pending Pickup":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Pending Pickup</Badge>
      case "Confirmed":
        return <Badge className="bg-maize/20 text-maize-foreground hover:bg-maize/20">Confirmed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-muted rounded" />
                <div className="h-4 w-56 bg-muted rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not signed in — show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4">
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome to WolverineMarket</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sign in to access your dashboard, manage listings, and track your transactions.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Signed in — show full dashboard
  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button asChild className="bg-maize text-maize-foreground hover:bg-maize/90">
            <Link href="/sell">
              <Plus className="w-4 h-4 mr-2" />
              List New Item
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-maize/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-maize-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Pre-bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-maize/20 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-maize text-maize" />
                </div>
                <div>
                  <p className="text-2xl font-bold">--</p>
                  <p className="text-sm text-muted-foreground">Credit Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="purchases" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              My Purchases
            </TabsTrigger>
            <TabsTrigger value="prebookings" className="gap-2">
              <Calendar className="w-4 h-4" />
              Pre-bookings
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="credit" className="gap-2">
              <Star className="w-4 h-4" />
              Credit Score
            </TabsTrigger>
          </TabsList>

          {/* My Listings Tab */}
          <TabsContent value="listings" className="mt-6">
            {myListings.length > 0 ? (
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          {listing.images[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold line-clamp-1">{listing.title}</p>
                              <p className="text-lg font-bold text-primary">${listing.price}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {listing.status !== "Sold" && (
                                <Link
                                  href={`/sell/edit/${listing.id}`}
                                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </Link>
                              )}
                              <button
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to delete this listing?")) return
                                  await deleteListing(listing)
                                }}
                                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                {listing.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {listing.category} &middot; {listing.condition} &middot; {listing.pickupLocation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No listings yet</h3>
                  <p className="text-muted-foreground mb-4">Start selling to other Michigan students!</p>
                  <Button asChild>
                    <Link href="/sell">Create Your First Listing</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Purchases Tab */}
          <TabsContent value="purchases" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No purchases yet</h3>
                <p className="text-muted-foreground mb-4">Browse items from other Michigan students!</p>
                <Button asChild variant="outline">
                  <Link href="/browse">Browse Items</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pre-bookings Tab */}
          <TabsContent value="prebookings" className="mt-6">
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="mb-4 space-y-2">
                {notifications.filter((n) => !n.is_read).map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 bg-maize/10 border border-maize/30 rounded-lg text-sm">
                    <Calendar className="w-4 h-4 mt-0.5 text-maize-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-muted-foreground">{notif.message}</p>
                    </div>
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={async () => {
                        await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id)
                        setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n))
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{booking.listing?.title || "Listing"}</p>
                          <p className="text-sm text-muted-foreground">
                            Buyer: {booking.buyer?.display_name || booking.buyer?.email || "Unknown"}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>Pickup: <strong>{new Date(booking.pickup_date).toLocaleDateString()}</strong></span>
                          </div>
                          {booking.notes && (
                            <p className="text-sm text-muted-foreground mt-1">Notes: {booking.notes}</p>
                          )}
                        </div>
                        <Badge className="bg-maize/20 text-maize-foreground">{booking.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No pre-bookings yet</h3>
                  <p className="text-muted-foreground">
                    Enable pre-booking on your listings to let buyers reserve items!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-6">
            {convsLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading conversations...</p>
                </CardContent>
              </Card>
            ) : conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map((conv) => {
                  const isBuyer = conv.buyer_id === user?.id
                  const otherPerson = isBuyer ? conv.seller : conv.buyer
                  const otherName = otherPerson?.display_name || otherPerson?.email || "Unknown"
                  const lastMsg = conv.messages.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )[0]
                  const unread = conv.messages.filter((m) => !m.read && m.receiver_id === user?.id).length

                  return (
                    <Card
                      key={conv.id}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${unread > 0 ? "border-primary/50" : ""}`}
                      onClick={() => setOpenChatConv(conv)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {conv.listing?.images?.[0] && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={conv.listing.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{otherName}</span>
                                {unread > 0 && (
                                  <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                                    {unread}
                                  </span>
                                )}
                              </div>
                              {lastMsg && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(lastMsg.created_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {conv.listing?.title || "Listing"}
                            </p>
                            {lastMsg && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {lastMsg.sender_id === user?.id ? "You: " : ""}{lastMsg.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground">
                    Messages from buyers will appear here.
                  </p>
                </CardContent>
              </Card>
            )}

            {openChatConv && user && (
              <ChatModal
                open={!!openChatConv}
                onClose={() => setOpenChatConv(null)}
                listingId={openChatConv.listing_id}
                listingTitle={openChatConv.listing?.title || "Listing"}
                sellerId={openChatConv.seller_id}
                sellerName={openChatConv.seller?.display_name || openChatConv.seller?.email || "Seller"}
                sellerEmail={openChatConv.seller?.email || ""}
              />
            )}
          </TabsContent>

          {/* Credit Score Tab */}
          <TabsContent value="credit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Credit Score</CardTitle>
                <CardDescription>
                  Build trust through successful transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="w-40 h-40 rounded-full border-8 border-muted flex items-center justify-center">
                    <div className="text-center">
                      <Star className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">No score yet</p>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Complete your first transaction to start building your credit score.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
