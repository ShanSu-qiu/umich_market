"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useListings } from "@/lib/listings-context"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("listings")
  const { user, isLoading } = useAuth()
  const { getMyListings } = useListings()
  const myListings = getMyListings()
  const activeCount = myListings.filter((l) => l.status === "Active").length

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
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No pre-bookings yet</h3>
                <p className="text-muted-foreground">
                  Enable pre-booking on your listings to let buyers reserve items!
                </p>
              </CardContent>
            </Card>
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
