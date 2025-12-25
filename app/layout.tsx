import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a clean, pro look
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "A&H Futsal - Play Like a Pro",
  description: "Premium single-court futsal facility booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "antialiased min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground")}>
        {children}
      </body>
    </html>
  );
}
