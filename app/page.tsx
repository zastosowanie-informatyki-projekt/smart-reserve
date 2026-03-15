import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  Plus,
  Search,
  CalendarCheck,
  Clock,
  Star,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-36">
        {/* subtle background radial gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="h-150 w-225 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>The easiest way to book a restaurant table</span>
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-inner">
            <UtensilsCrossed className="h-9 w-9 text-primary" />
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find and reserve tables at the{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative">best restaurants</span>
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Browse restaurants, check availability, and book your table in seconds. No phone calls needed.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/restaurants">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Restaurants
              </Button>
            </Link>
            <Link href="/dashboard/new">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                List Your Restaurant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Book a table in 3 simple steps</h2>
            <p className="mt-2 text-muted-foreground">From search to confirmation in under a minute.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: <Search className="h-6 w-6" />,
                step: "1",
                title: "Search",
                description: "Filter restaurants by city, cuisine, or name to find the perfect match.",
              },
              {
                icon: <CalendarCheck className="h-6 w-6" />,
                step: "2",
                title: "Pick a slot",
                description: "Choose your date, time, and party size. See real-time availability.",
              },
              {
                icon: <Clock className="h-6 w-6" />,
                step: "3",
                title: "Confirm",
                description: "Instantly secure your reservation — no waiting, no phone tag.",
              },
            ].map(({ icon, step, title, description }) => (
              <div
                key={step}
                className="relative flex flex-col items-center gap-4 rounded-2xl border bg-background p-6 text-center shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {icon}
                </div>
                <div className="absolute -top-3.5 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step}
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything you need</h2>
            <p className="mt-2 text-muted-foreground">Built for both diners and restaurant owners.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Search className="h-5 w-5" />,
                title: "Smart search",
                description: "Filter by city, cuisine type, and more to discover exactly what you're after.",
              },
              {
                icon: <CalendarCheck className="h-5 w-5" />,
                title: "Real-time availability",
                description: "See open tables and time slots instantly — always up to date.",
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Secure bookings",
                description: "Your reservations are confirmed and protected with secure authentication.",
              },
              {
                icon: <Smartphone className="h-5 w-5" />,
                title: "Mobile friendly",
                description: "A seamless experience on any device — phone, tablet, or desktop.",
              },
              {
                icon: <Clock className="h-5 w-5" />,
                title: "Opening hours aware",
                description: "Time slots respect each restaurant's schedule so you never book outside hours.",
              },
              {
                icon: <UtensilsCrossed className="h-5 w-5" />,
                title: "List your venue",
                description:
                  "Restaurant owners can easily add their place, set tables, and manage reservations.",
              },
            ].map(({ icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-2xl border p-6 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {icon}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t bg-muted/40 px-4 py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to find your table?</h2>
          <p className="text-muted-foreground">
            Join thousands of diners who skip the phone call and book online.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/restaurants">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Restaurants
              </Button>
            </Link>
            <Link href="/dashboard/new">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                List Your Restaurant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
