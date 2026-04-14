"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  ShoppingBag, 
  Calendar, 
  Star, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageCircle,
  XCircle
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreditScoreBadge } from "@/components/wolverine/credit-score-badge"
import { mockItems, mockUser } from "@/lib/data"

// Mock dashboard data
const myListings = mockItems.slice(0, 3).map((item, i) => ({
  ...item,
  status: i === 0 ? "Active" : i === 1 ? "Pre-booked" : "Sold",
  views: Math.floor(Math.random() * 100) + 20,
  messages: Math.floor(Math.random() * 5),
}))

const myPurchases = [
  {
    id: "p1",
    title: "Desk Lamp - LED adjustable",
    price: 15,
    seller: "Alex P. '26",
    status: "Completed",
    date: "Apr 10, 2024",
    image: "/placeholder.svg",
  },
  {
    id: "p2",
    title: "Calculus Textbook",
    price: 25,
    seller: "Jordan M. '25",
    status: "Pending Pickup",
    date: "Apr 18, 2024",
    image: "/placeholder.svg",
  },
]

const preBookings = [
  {
    id: "pb1",
    title: "Mini Fridge - Perfect for dorm",
    price: 60,
    buyer: "Taylor S. '28",
    pickupDate: "Aug 25, 2024",
    status: "Confirmed",
    image: "/placeholder.svg",
  },
]

const creditFactors = [
  { name: "On-time Pickup Rate", value: 98, icon: Clock },
  { name: "Response Time", value: 95, icon: MessageCircle, label: "< 1 hour" },
  { name: "Review Average", value: 96, icon: Star },
  { name: "Cancellation Rate", value: 98, icon: XCircle, label: "2% (Low)" },
]

const transactions = [
  { id: "t1", type: "Sale", item: "IKEA MALM Desk", amount: 45, date: "Apr 5, 2024", rating: 5 },
  { id: "t2", type: "Sale", item: "Kitchen Starter Pack", amount: 40, date: "Mar 28, 2024", rating: 5 },
  { id: "t3", type: "Purchase", item: "Monitor Stand", amount: 20, date: "Mar 15, 2024", rating: 5 },
  { id: "t4", type: "Sale", item: "Textbooks Bundle", amount: 75, date: "Feb 20, 2024", rating: 4 },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("listings")
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
      case "Pre-booked":
        return <Badge className="bg-maize/20 text-maize-foreground hover:bg-maize/20">Pre-booked</Badge>
      case "Sold":
        return <Badge variant="secondary">Sold</Badge>
      case "Expired":
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>
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
  
  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {mockUser.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{mockUser.name}</h1>
              <p className="text-muted-foreground">{mockUser.email}</p>
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
                  <p className="text-2xl font-bold">{myListings.length}</p>
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
                  <p className="text-2xl font-bold">{mockUser.transactions}</p>
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
                  <p className="text-2xl font-bold">{preBookings.length}</p>
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
                  <p className="text-2xl font-bold">{mockUser.rating}</p>
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
            <div className="space-y-4">
              {myListings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/item/${listing.id}`} className="font-semibold hover:text-primary line-clamp-1">
                              {listing.title}
                            </Link>
                            <p className="text-lg font-bold text-primary">${listing.price}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Listing
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getStatusBadge(listing.status)}
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {listing.views} views
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {listing.messages} messages
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {myListings.length === 0 && (
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
            </div>
          </TabsContent>
          
          {/* My Purchases Tab */}
          <TabsContent value="purchases" className="mt-6">
            <div className="space-y-4">
              {myPurchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={purchase.image}
                          alt={purchase.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{purchase.title}</h3>
                            <p className="text-lg font-bold text-primary">${purchase.price}</p>
                            <p className="text-sm text-muted-foreground">
                              Seller: {purchase.seller}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(purchase.status)}
                            <p className="text-xs text-muted-foreground mt-1">{purchase.date}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Pre-bookings Tab */}
          <TabsContent value="prebookings" className="mt-6">
            <div className="space-y-4">
              {preBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={booking.image}
                          alt={booking.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{booking.title}</h3>
                            <p className="text-lg font-bold text-primary">${booking.price}</p>
                            <p className="text-sm text-muted-foreground">
                              Buyer: {booking.buyer}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm">
                            Pickup scheduled: <strong>{booking.pickupDate}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {preBookings.length === 0 && (
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
            </div>
          </TabsContent>
          
          {/* Credit Score Tab */}
          <TabsContent value="credit" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Score Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Credit Score</CardTitle>
                  <CardDescription>
                    Build trust through successful transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full border-8 border-maize/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-8 h-8 fill-maize text-maize" />
                            <span className="text-4xl font-bold">{mockUser.rating}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">out of 5.0</p>
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +0.2
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    You&apos;re in the top 15% of sellers on WolverineMarket!
                  </p>
                </CardContent>
              </Card>
              
              {/* Factors Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Breakdown</CardTitle>
                  <CardDescription>
                    Factors that affect your credit score
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {creditFactors.map((factor) => (
                    <div key={factor.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <factor.icon className="w-4 h-4 text-muted-foreground" />
                          <span>{factor.name}</span>
                        </div>
                        <span className="font-medium">
                          {factor.label || `${factor.value}%`}
                        </span>
                      </div>
                      <Progress value={factor.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Transaction History */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Your recent sales and purchases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "Sale" 
                              ? "bg-green-100 dark:bg-green-900/30" 
                              : "bg-blue-100 dark:bg-blue-900/30"
                          }`}>
                            {tx.type === "Sale" ? (
                              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.item}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            tx.type === "Sale" ? "text-green-600 dark:text-green-400" : ""
                          }`}>
                            {tx.type === "Sale" ? "+" : "-"}${tx.amount}
                          </p>
                          <div className="flex items-center gap-0.5 justify-end">
                            {[...Array(tx.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-maize text-maize" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
