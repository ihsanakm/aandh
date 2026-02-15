import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google"; // Using Inter for a clean, pro look
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const montserrat = Montserrat({ subsets: ["latin"], variable: '--font-heading', weight: ['400', '600', '700', '900'] });

export const metadata: Metadata = {
  title: "A&H Futsal - Play Like a Pro",
  description: "Premium single-court futsal facility booking.",
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, montserrat.variable, "font-sans antialiased min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
