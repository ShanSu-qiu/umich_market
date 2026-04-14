"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Upload, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  DollarSign, 
  MapPin, 
  Calendar as CalendarIcon,
  Sparkles,
  Star,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CampusLocationPicker } from "@/components/wolverine/campus-location-picker"
import { categories } from "@/lib/data"

const conditions = [
  { value: "New", description: "Brand new, never used" },
  { value: "Like New", description: "Barely used, no visible wear" },
  { value: "Good", description: "Some use, minor wear" },
  { value: "Fair", description: "Noticeable wear, fully functional" },
]

const steps = [
  { id: 1, title: "Photos", icon: Camera },
  { id: 2, title: "Details", icon: Sparkles },
  { id: 3, title: "Price", icon: DollarSign },
  { id: 4, title: "Location", icon: MapPin },
  { id: 5, title: "Availability", icon: CalendarIcon },
]

export default function SellPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form state
  const [photos, setPhotos] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [price, setPrice] = useState("")
  const [enablePrebook, setEnablePrebook] = useState(false)
  const [pickupLocation, setPickupLocation] = useState("")
  const [availableFrom, setAvailableFrom] = useState<Date>()
  const [availableTo, setAvailableTo] = useState<Date>()
  
  const [isDragging, setIsDragging] = useState(false)

  // Suggested price (mock)
  const suggestedPrice = 45

  const processFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) return
    const newPhotos = imageFiles.map(() => "/placeholder.svg?height=400&width=400")
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 6))
  }, [])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files)
  }, [processFiles])
  
  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }
  
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return photos.length > 0
      case 2:
        return title.trim() && category && condition
      case 3:
        return price && Number(price) > 0
      case 4:
        return pickupLocation
      case 5:
        return availableFrom
      default:
        return true
    }
  }
  
  const handleSubmit = () => {
    // In a real app, this would submit to an API
    alert("Listing created successfully!")
    router.push("/dashboard")
  }
  
  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">List an Item</h1>
        <p className="text-muted-foreground mb-8">
          Reach thousands of verified Michigan students
        </p>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-maize text-maize-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 hidden sm:block",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Step 1: Photos */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">Add Photos</h2>
                      <p className="text-sm text-muted-foreground">
                        Upload up to 6 photos. The first photo will be the cover.
                      </p>
                    </div>
                    
                    <div
                      className={cn(
                        "grid grid-cols-3 gap-3 rounded-lg p-3 -m-3 transition-colors",
                        isDragging && "bg-maize/10 ring-2 ring-maize ring-offset-2"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <Badge className="absolute bottom-1 left-1 text-xs">Cover</Badge>
                          )}
                        </div>
                      ))}

                      {photos.length < 6 && (
                        <label className={cn(
                          "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
                          isDragging
                            ? "border-maize bg-maize/5 text-maize"
                            : "border-muted-foreground/30 hover:border-muted-foreground/50"
                        )}>
                          <Upload className={cn("w-8 h-8 mb-2", isDragging ? "text-maize" : "text-muted-foreground")} />
                          <span className={cn("text-sm", isDragging ? "text-maize font-medium" : "text-muted-foreground")}>
                            {isDragging ? "Drop here" : "Add Photo"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Step 2: Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">Item Details</h2>
                      <p className="text-sm text-muted-foreground">
                        Describe your item clearly to attract buyers.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., IKEA MALM Desk - White"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the item, including any defects or notable features..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {conditions.map((cond) => (
                            <button
                              key={cond.value}
                              type="button"
                              onClick={() => setCondition(cond.value)}
                              className={cn(
                                "p-3 rounded-lg border text-left transition-colors",
                                condition === cond.value
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground/50"
                              )}
                            >
                              <p className="font-medium text-sm">{cond.value}</p>
                              <p className="text-xs text-muted-foreground">{cond.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Price */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">Set Your Price</h2>
                      <p className="text-sm text-muted-foreground">
                        Price your item competitively based on demand.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="price"
                            type="number"
                            min="1"
                            placeholder="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="pl-10 text-2xl font-bold h-14"
                          />
                        </div>
                      </div>
                      
                      {title && category && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 text-maize" />
                            <span className="font-medium">Suggested price based on demand:</span>
                            <span className="font-bold">${suggestedPrice}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Based on similar items in {category}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Enable Pre-booking</p>
                          <p className="text-sm text-muted-foreground">
                            Let buyers reserve before arriving on campus
                          </p>
                        </div>
                        <Switch
                          checked={enablePrebook}
                          onCheckedChange={setEnablePrebook}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 4: Location */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">Pickup Location</h2>
                      <p className="text-sm text-muted-foreground">
                        Choose a safe, convenient campus location for pickup.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Location</Label>
                        <CampusLocationPicker
                          value={pickupLocation}
                          onValueChange={setPickupLocation}
                        />
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg text-sm">
                        <p className="font-medium mb-2">Tips for safe pickup:</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>- Meet in public, well-lit areas</li>
                          <li>- Campus buildings during business hours are ideal</li>
                          <li>- Let someone know about your meeting</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 5: Availability */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">Availability Window</h2>
                      <p className="text-sm text-muted-foreground">
                        When is this item available for pickup?
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Available From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start font-normal">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {availableFrom ? format(availableFrom, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={availableFrom}
                                onSelect={setAvailableFrom}
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Available Until (optional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start font-normal">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {availableTo ? format(availableTo, "PPP") : "No end date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={availableTo}
                                onSelect={setAvailableTo}
                                disabled={(date) => date < (availableFrom || new Date())}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  
                  {currentStep < 5 ? (
                    <Button
                      onClick={() => setCurrentStep((prev) => prev + 1)}
                      disabled={!canProceed()}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceed()}
                      className="bg-maize text-maize-foreground hover:bg-maize/90"
                    >
                      Publish Listing
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4">Preview</h3>
              <Card className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  {photos[0] ? (
                    <Image
                      src={photos[0]}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Camera className="w-12 h-12" />
                    </div>
                  )}
                  {enablePrebook && (
                    <Badge className="absolute top-2 left-2 bg-maize text-maize-foreground">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      Pre-book
                    </Badge>
                  )}
                  {condition && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      {condition}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold line-clamp-2 mb-1">
                    {title || "Your item title"}
                  </h4>
                  <p className="text-xl font-bold text-primary mb-2">
                    ${price || "0"}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">You</span>
                    <Star className="w-3 h-3 fill-maize text-maize" />
                    <span>5.0</span>
                  </div>
                  {pickupLocation && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{pickupLocation}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
