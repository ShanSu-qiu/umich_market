import { ShieldCheck, Star, MapPin } from "lucide-react"

export function TrustIndicators() {
  const indicators = [
    {
      icon: ShieldCheck,
      title: "@umich.edu verified",
      description: "All users verified with Michigan email",
    },
    {
      icon: Star,
      title: "Credit Score system",
      description: "Build trust through successful transactions",
    },
    {
      icon: MapPin,
      title: "Campus pickup locations",
      description: "Safe, convenient meeting spots on campus",
    },
  ]
  
  return (
    <section className="py-12 sm:py-16 bg-card">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold mb-8">
          Why students trust WolverineMarket
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {indicators.map((indicator) => (
            <div key={indicator.title} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-maize/20 flex items-center justify-center mb-4">
                <indicator.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{indicator.title}</h3>
              <p className="text-muted-foreground text-sm">{indicator.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
