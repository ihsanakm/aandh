import { BookingWidget } from "@/components/booking/booking-widget";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground">A</span>
            </div>
            <span className="font-bold tracking-tight">A&H Futsal</span>
          </div>
          <div className="hidden sm:block">
            <Button variant="ghost" size="sm">Admin Login</Button>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto flex max-w-5xl flex-col px-4 pt-24 pb-12 sm:px-6">

        {/* Hero Section */}
        <section className="relative mb-12 overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 text-center ">
          {/* Background Image / Gradient */}
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=2071&auto=format&fit=crop"
              alt="Futsal Court"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center py-20 px-6">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-6 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Bookings Open for Today
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:max-w-3xl">
              Play Like a Pro at <span className="text-primary">A&H Futsal</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg text-zinc-300">
              Premium single-court facility in the heart of the city. Book your slot in seconds. No login required.
            </p>
            <Button size="lg" className="rounded-full text-base font-bold shadow-[0_0_30px_rgba(74,222,128,0.3)] animate-bounce-slow">
              Reserve Your Slot
            </Button>
          </div>
        </section>

        {/* Booking Section */}
        <section id="book" className="mx-auto w-full max-w-md sm:max-w-2xl">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold">Book a Court</h2>
            <p className="text-muted-foreground">Select a date and time to get started.</p>
          </div>

          <BookingWidget />
        </section>

        {/* Features / Amenities */}
        {/* Facilities Section */}
        <section className="mt-32">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">World Class Facilities</h2>
            <p className="mt-4 text-lg text-muted-foreground">Everything you need for the perfect game.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "FIFA Turf", img: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop", desc: "Top-tier 50mm grass" },
              { title: "Modern Showers", img: "https://images.unsplash.com/photo-1552308995-2baac1ad5490?q=80&w=2070&auto=format&fit=crop", desc: "Clean & private" },
              { title: "Secure Parking", img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070&auto=format&fit=crop", desc: "24/7 monitored" },
              { title: "Pro Equipment", img: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=2070&auto=format&fit=crop", desc: "Balls & bibs available" }
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-zinc-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mt-32 mb-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Player Reviews</h2>
            <p className="text-muted-foreground">See what the local community is saying.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Alex M.", role: "Regular Player", text: "Best turf in town. The ball moves perfectly and the grip is just right. Definitely our regular spot now.", img: "https://i.pravatar.cc/150?u=a" },
              { name: "Sarah K.", role: "Team Captain", text: "Lighting is amazing for night games. No dark spots on the corners. Parking is super convenient too.", img: "https://i.pravatar.cc/150?u=b" },
              { name: "James R.", role: "Weekend League", text: "Booking process is super smooth. Love that I can see the slots in real time. Highly recommended!", img: "https://i.pravatar.cc/150?u=c" }
            ].map((review, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-8 transition-colors hover:bg-white/10">
                <div className="mb-4 flex gap-1 text-primary">
                  {[1, 2, 3, 4, 5].map(star => <span key={star}>★</span>)}
                </div>
                <p className="mb-6 text-zinc-300 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                    <Image src={review.img} alt={review.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="mt-12 border-t border-white/5 py-8 text-center text-sm text-muted-foreground">
        © 2024 A&H Futsal. All rights reserved.
      </footer>
    </div>
  );
}
