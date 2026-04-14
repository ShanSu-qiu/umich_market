export type Item = {
  id: string
  title: string
  description: string
  price: number
  condition: string
  category: string
  images: string[]
  sellerId: string
  sellerName: string
  sellerRating?: number
  sellerTransactions?: number
  sellerMemberSince?: string
  sellerVerified?: boolean
  pickupLocation: string
  pickupArea?: "Central Campus" | "North Campus" | "Off-campus"
  preBookAvailable: boolean
  createdAt: string
  demandIndicator?: {
    type: "below" | "above" | "normal"
    percentage?: number
  }
}

export type User = {
  id: string
  name: string
  email: string
  rating: number
  transactions: number
  memberSince: string
  verified: boolean
  onTimeRate: number
  responseTime: string
  reviewAverage: number
  cancellationRate: number
}

export const categories = [
  "Furniture",
  "Electronics",
  "Textbooks",
  "Kitchen",
  "Bikes",
  "Clothing",
  "Dorm Essentials",
]

export const pickupLocations = {
  "Central Campus": [
    "Michigan Union",
    "Shapiro Library",
    "Diag",
    "East Quad",
    "South Quad",
    "West Quad",
  ],
  "North Campus": [
    "Bursley Hall",
    "Pierpont Commons",
    "Duderstadt Center",
    "EECS Building",
  ],
  "Off-campus": [
    "Kerrytown",
    "State Street",
    "South University",
    "Packard Street",
  ],
}

export function getSeasonalMessage(): { title: string; subtitle: string; type: "graduation" | "movein" | "normal" } {
  const month = new Date().getMonth()
  
  if (month >= 3 && month <= 4) {
    return {
      title: "Graduation Sale Season",
      subtitle: "847 items available from graduating students",
      type: "graduation",
    }
  } else if (month >= 7 && month <= 8) {
    return {
      title: "New Student? Pre-book before you arrive",
      subtitle: "Reserve items now, pick up during move-in week",
      type: "movein",
    }
  } else {
    return {
      title: "Find great deals on campus",
      subtitle: "Buy and sell with verified Michigan students",
      type: "normal",
    }
  }
}
