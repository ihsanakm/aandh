"use client"

import { BookingWidget } from "@/components/booking/booking-widget";
import { FoodCourtSection } from "@/components/food-court/food-court-section";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle, Clock, MapPin, Trophy, Users, Zap, Star, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)]">
              <span className="font-heading font-black text-black text-sm sm:text-base">A</span>
            </div>
            <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground">A&H <span className="text-primary">FUTSAL</span></span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#book" className="hover:text-primary transition-colors">Book Now</Link>
              <Link href="#facilities" className="hover:text-primary transition-colors">Facilities</Link>
              <Link href="#food" className="hover:text-primary transition-colors">Food Court</Link>
            </div>
            <Link href="#book" className="md:hidden">
              <Button size="sm" className="bg-primary text-black hover:bg-primary/90 text-xs px-3">
                Book Now
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hidden sm:flex border-primary/20 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all">
                Admin Login
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>

      <main className="flex flex-col">

        {/* Hero Section */}
        <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center pt-14 sm:pt-16">
          {/* Background Video/Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop"
              alt="Professional Futsal Arena"
              fill
              className="object-cover opacity-60"
              priority
            />
            {/* Dynamic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/80 to-secondary/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)] opacity-80"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center flex flex-col items-center animate-slide-up py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-primary mb-4 sm:mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-primary"></span>
              </span>
              Slots Available Tonight
            </div>

            <h1 className="mb-4 sm:mb-6 max-w-4xl text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-foreground drop-shadow-2xl leading-[1.1]">
              YOUR GAME. <br />
              YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">COURT.</span>
            </h1>

            <p className="mb-6 sm:mb-10 max-w-xl text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground font-medium leading-relaxed px-2">
              Experience the rush of professional indoor soccer.
              FIFA-grade turf, energetic atmosphere, and a community that plays to win.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md sm:max-w-none justify-center px-4 sm:px-0">
              <Button size="lg" className="h-12 sm:h-14 rounded-full px-6 sm:px-10 text-base sm:text-lg font-bold bg-primary text-black hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_30px_rgba(57,255,20,0.4)]" asChild>
                <Link href="#book">
                  Book Your Slot <Zap className="ml-2 h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 sm:h-14 rounded-full px-6 sm:px-10 text-base sm:text-lg font-bold border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40" asChild>
                <Link href="#facilities">
                  View Facilities
                </Link>
              </Button>
            </div>

            <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="font-semibold text-foreground text-sm sm:text-base">Certified Venue</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="font-semibold text-foreground text-sm sm:text-base">500+ Members</span>
              </div>
            </div>

          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/50">
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 rotate-90" />
          </div>
        </section>

        {/* Quick Facts Strip */}
        <section className="border-y border-border bg-card/50 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { label: "Surface", value: "FIFA Pro Turf", icon: Trophy },
              { label: "Open", value: "6 AM - 12 AM", icon: Clock },
              { label: "Format", value: "5v5 / 6v6", icon: Users },
              { label: "Location", value: "Central City", icon: MapPin },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-3 sm:p-6 text-center group hover:bg-muted/50 transition-colors">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-secondary mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-sm sm:text-lg md:text-xl font-bold text-foreground leading-tight">{item.value}</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Booking Section */}
        <section id="book" className="py-12 sm:py-16 md:py-24 relative bg-background">
          <div className="container mx-auto px-4 sm:px-6 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">

              {/* Booking Widget Card - Always first on mobile */}
              <div className="lg:order-1 w-full min-w-0">
                <div className="relative p-0.5 sm:p-1 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-border/50 to-transparent">
                  <div className="bg-card rounded-xl sm:rounded-[22px] p-3 sm:p-6 md:p-8 shadow-2xl border border-border overflow-hidden">
                    <div className="mb-3 sm:mb-6 flex flex-row items-center justify-between gap-2">
                      <h3 className="text-lg sm:text-2xl font-bold text-foreground">Book a Slot</h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-primary font-medium bg-primary/10 px-2 sm:px-3 py-1 rounded-full">
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary"></span>
                        </span>
                        Live
                      </div>
                    </div>
                    <BookingWidget />
                  </div>
                </div>
              </div>

              {/* Info Section - After booking widget on mobile */}
              <div className="lg:order-2 hidden sm:block">
                <h2 className="text-primary font-bold tracking-wider uppercase mb-2 text-sm sm:text-base">Reserve Your Spot</h2>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 sm:mb-6 leading-tight">
                  LESS WAITING. <br />MORE <span className="text-gradient">PLAYING.</span>
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  Our streamlined booking system lets you secure your court in seconds. Real-time availability, instant confirmation, and automated receipts.
                </p>

                <div className="space-y-3 sm:space-y-4">
                  {[
                    "Select your preferred date & time",
                    "Instant PDF receipt generation",
                    "Real-time slot availability"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-all group">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-black transition-colors flex-shrink-0">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className="font-medium text-muted-foreground text-sm sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 sm:py-16 md:py-24 bg-card/30 relative">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">Why Top Teams Choose Us</h2>
              <p className="text-base sm:text-lg text-muted-foreground">We didn't just build a court; we built the ultimate football experience.</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                { title: "Pro-Grade Turf", desc: "Our 50mm shock-absorbing turf prevents injuries and ensures true ball roll.", icon: Zap },
                { title: "Strategic Lighting", desc: "Broadcast-quality LED lighting positioned to eliminate shadows and glare.", icon: Star },
                { title: "League Management", desc: "Join our competitive leagues or host your own tournament with ease.", icon: Trophy },
              ].map((feature, i) => (
                <div key={i} className="p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-b from-muted to-transparent border border-border hover:border-primary/30 transition-all group">
                  <div className="mb-4 sm:mb-6 inline-flex p-2.5 sm:p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <section id="facilities" className="py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-4 sm:gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">World Class Facilities</h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl">From the locker room to the pitch, we've got you covered.</p>
              </div>
              <Button variant="outline" className="hidden md:flex">View Full Specs</Button>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              {[
                { title: "The Pitch", img: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop", desc: "Top-tier 50mm grass" },
                { title: "Modern Showers", img: "https://images.unsplash.com/photo-1552308995-2baac1ad5490?q=80&w=2070&auto=format&fit=crop", desc: "Clean & private" },
                { title: "Pro Shop", img: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=2070&auto=format&fit=crop", desc: "Gear & hydration" },
                { title: "Players Lounge", img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070&auto=format&fit=crop", desc: "Relax post-match" }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card aspect-[4/5]">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 p-3 sm:p-6 w-full">
                      <h3 className="text-base sm:text-xl font-bold text-white mb-0.5 sm:mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-zinc-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Food Court Section */}
        <section id="food" className="py-12 sm:py-16 md:py-24 bg-card/20 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <FoodCourtSection />
          </div>
        </section>

        {/* Testimonials */}
        < section className="py-12 sm:py-16 md:py-24 overflow-hidden" >
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">The Community Speaks</h2>
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg sm:text-xl">
                <Star className="fill-current h-5 w-5" />
                <span>4.9/5 Rating</span>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[
                { name: "Alex M.", role: "Regular Player", text: "Best turf in town. The ball moves perfectly and the grip is just right. Definitely our regular spot now.", img: "https://i.pravatar.cc/150?u=a" },
                { name: "Sarah K.", role: "Team Captain", text: "Lighting is amazing for night games. No dark spots on the corners. Parking is super convenient too.", img: "https://i.pravatar.cc/150?u=b" },
                { name: "James R.", role: "League Winner", text: "Booking process is super smooth. Love that I can see the slots in real time. Highly recommended!", img: "https://i.pravatar.cc/150?u=c" }
              ].map((review, i) => (
                <div key={i} className="rounded-xl sm:rounded-2xl border border-border bg-muted/30 p-5 sm:p-8 hover:bg-muted/50 transition-colors relative">
                  <div className="absolute top-5 sm:top-8 right-5 sm:right-8 text-primary/20">
                    <svg width="30" height="30" className="sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-primary/20">
                      <Image src={review.img} alt={review.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm sm:text-base">{review.name}</p>
                      <p className="text-xs sm:text-sm text-primary">{review.role}</p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed relative z-10">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background pt-10 sm:pt-16 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-primary flex items-center justify-center font-bold text-black text-sm">A</div>
                <span className="font-bold text-lg sm:text-xl text-foreground">A&H <span className="text-primary">FUTSAL</span></span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm">
                The premier destination for indoor soccer enthusiasts.
                Join our community and elevate your game today.
              </p>
              <div className="flex gap-3 sm:gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-black transition-colors cursor-pointer">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4 sm:mb-6 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-2 sm:space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Book a Court</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Our Facilites</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Leagues</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4 sm:mb-6 text-sm sm:text-base">Contact</h4>
              <ul className="space-y-2 sm:space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span>123 Sports Complex Blvd, City</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Mon-Sun: 6am - 12am</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
            <p>© 2026 A&H Futsal. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
