export type Item = {
  id: string
  title: string
  description: string
  price: number
  condition: "New" | "Like New" | "Good" | "Fair"
  category: string
  images: string[]
  sellerId: string
  sellerName: string
  sellerRating: number
  sellerTransactions: number
  sellerMemberSince: string
  sellerVerified: boolean
  pickupLocation: string
  pickupArea: "Central Campus" | "North Campus" | "Off-campus"
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

export const mockItems: Item[] = [
  {
    id: "1",
    title: "IKEA MALM Desk - Graduating, must go!",
    description: "Great condition IKEA MALM desk. Perfect for studying. Some minor scratches on the surface but nothing major. Includes the cable management net underneath. Moving out after graduation so it needs to go!",
    price: 45,
    condition: "Good",
    category: "Furniture",
    images: ["/placeholder.svg", "/placeholder.svg"],
    sellerId: "user1",
    sellerName: "Sarah K. '25",
    sellerRating: 4.8,
    sellerTransactions: 12,
    sellerMemberSince: "Sep 2021",
    sellerVerified: true,
    pickupLocation: "Michigan Union",
    pickupArea: "Central Campus",
    preBookAvailable: true,
    createdAt: "2024-04-15",
    demandIndicator: { type: "below", percentage: 12 },
  },
  {
    id: "2",
    title: "Mini Fridge - Perfect for dorm",
    description: "Compact mini fridge, perfect for any dorm room. Has a small freezer compartment. Works perfectly, just upgraded to a larger one. Clean and ready to go.",
    price: 60,
    condition: "Like New",
    category: "Dorm Essentials",
    images: ["/placeholder.svg"],
    sellerId: "user2",
    sellerName: "Mike T. '26",
    sellerRating: 4.9,
    sellerTransactions: 8,
    sellerMemberSince: "Aug 2022",
    sellerVerified: true,
    pickupLocation: "Bursley Hall",
    pickupArea: "North Campus",
    preBookAvailable: true,
    createdAt: "2024-04-18",
    demandIndicator: { type: "above" },
  },
  {
    id: "3",
    title: "Organic Chemistry Textbook (CHEM 210)",
    description: "Organic Chemistry 9th Edition by Wade. Minimal highlighting, no torn pages. Includes the study guide. Perfect for CHEM 210/211.",
    price: 35,
    condition: "Good",
    category: "Textbooks",
    images: ["/placeholder.svg"],
    sellerId: "user3",
    sellerName: "Emily R. '27",
    sellerRating: 5.0,
    sellerTransactions: 3,
    sellerMemberSince: "Jan 2024",
    sellerVerified: true,
    pickupLocation: "Shapiro Library",
    pickupArea: "Central Campus",
    preBookAvailable: false,
    createdAt: "2024-04-20",
  },
  {
    id: "4",
    title: "Schwinn Bike - Great for campus commute",
    description: "Schwinn hybrid bike, 21 speeds. Perfect for getting around campus and Ann Arbor. Recently tuned up, new brake pads. Includes a lock and lights.",
    price: 120,
    condition: "Good",
    category: "Bikes",
    images: ["/placeholder.svg", "/placeholder.svg"],
    sellerId: "user4",
    sellerName: "James L. '25",
    sellerRating: 4.7,
    sellerTransactions: 15,
    sellerMemberSince: "Aug 2021",
    sellerVerified: true,
    pickupLocation: "Diag",
    pickupArea: "Central Campus",
    preBookAvailable: true,
    createdAt: "2024-04-12",
    demandIndicator: { type: "below", percentage: 8 },
  },
  {
    id: "5",
    title: "Kitchen starter pack (pots, pans, utensils)",
    description: "Everything you need to start cooking! Includes 2 pots, 1 frying pan, spatula, ladle, and a full utensil set. Great for your first apartment.",
    price: 40,
    condition: "Good",
    category: "Kitchen",
    images: ["/placeholder.svg"],
    sellerId: "user1",
    sellerName: "Sarah K. '25",
    sellerRating: 4.8,
    sellerTransactions: 12,
    sellerMemberSince: "Sep 2021",
    sellerVerified: true,
    pickupLocation: "South Quad",
    pickupArea: "Central Campus",
    preBookAvailable: true,
    createdAt: "2024-04-16",
  },
  {
    id: "6",
    title: "MacBook Pro Charger (USB-C)",
    description: "Genuine Apple 96W USB-C charger. Works with all MacBook Pro models. Cable included. Moving to a different laptop so don't need it anymore.",
    price: 25,
    condition: "Like New",
    category: "Electronics",
    images: ["/placeholder.svg"],
    sellerId: "user5",
    sellerName: "Alex P. '26",
    sellerRating: 4.6,
    sellerTransactions: 5,
    sellerMemberSince: "Jan 2023",
    sellerVerified: true,
    pickupLocation: "Duderstadt Center",
    pickupArea: "North Campus",
    preBookAvailable: false,
    createdAt: "2024-04-21",
  },
  {
    id: "7",
    title: "Dorm Bedding Set - Twin XL",
    description: "Complete Twin XL bedding set: sheets, comforter, and 2 pillows. Michigan Blue color! Only used for one semester, in great condition.",
    price: 55,
    condition: "Like New",
    category: "Dorm Essentials",
    images: ["/placeholder.svg"],
    sellerId: "user6",
    sellerName: "Nina S. '27",
    sellerRating: 4.9,
    sellerTransactions: 2,
    sellerMemberSince: "Aug 2023",
    sellerVerified: true,
    pickupLocation: "East Quad",
    pickupArea: "Central Campus",
    preBookAvailable: true,
    createdAt: "2024-04-19",
    demandIndicator: { type: "above" },
  },
  {
    id: "8",
    title: "Standing Desk Converter",
    description: "Adjustable standing desk converter. Fits on any desk. Multiple height settings. Great for ergonomic studying. Originally $150 on Amazon.",
    price: 65,
    condition: "Good",
    category: "Furniture",
    images: ["/placeholder.svg"],
    sellerId: "user7",
    sellerName: "David W. '25",
    sellerRating: 4.5,
    sellerTransactions: 7,
    sellerMemberSince: "Sep 2021",
    sellerVerified: true,
    pickupLocation: "Kerrytown",
    pickupArea: "Off-campus",
    preBookAvailable: false,
    createdAt: "2024-04-14",
  },
]

export const mockUser: User = {
  id: "user1",
  name: "Sarah K.",
  email: "sarahk@umich.edu",
  rating: 4.8,
  transactions: 12,
  memberSince: "Sep 2021",
  verified: true,
  onTimeRate: 98,
  responseTime: "< 1 hour",
  reviewAverage: 4.8,
  cancellationRate: 2,
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
