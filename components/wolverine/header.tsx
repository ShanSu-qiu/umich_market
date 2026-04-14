"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Search, User, Menu, X, Plus, LogIn } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function Header() {
  const [open, setOpen] = useState(false)
  
  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/sell", label: "Sell" },
    { href: "/dashboard", label: "Dashboard" },
  ]
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">WolverineMarket</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/browse">
                <Search className="w-5 h-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="hidden sm:flex text-sm font-medium">
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Link>
            </Button>
            <Button asChild className="hidden sm:flex bg-maize text-maize-foreground hover:bg-maize/90">
              <Link href="/sell">
                <Plus className="w-4 h-4 mr-1" />
                List Item
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <User className="w-5 h-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
            
            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="my-2" />
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-maize text-maize-foreground hover:bg-maize/90">
                      Sign up
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
