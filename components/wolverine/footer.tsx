import Link from "next/link"
import { Package } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">WolverineMarket</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The trusted marketplace for University of Michigan students.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse" className="hover:text-foreground transition-colors">Browse All</Link></li>
              <li><Link href="/browse?category=Furniture" className="hover:text-foreground transition-colors">Furniture</Link></li>
              <li><Link href="/browse?category=Electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
              <li><Link href="/browse?category=Textbooks" className="hover:text-foreground transition-colors">Textbooks</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/sell" className="hover:text-foreground transition-colors">Sell an Item</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">How it Works</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Safety Tips</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Built for Michigan students, by Michigan students.
          </p>
          <p className="text-sm text-muted-foreground">
            Go Blue!
          </p>
        </div>
      </div>
    </footer>
  )
}
