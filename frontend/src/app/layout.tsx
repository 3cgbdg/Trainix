import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "@/styles/globals.css";
import CookieConsent from "@/components/CookieConsent";
import QueryProvider from "@/providers/QueryProvider";
import ReduxProvider from "@/providers/ReduxProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trainix",
    template: "%s · Trainix",
  },
  description: "Personalized workouts, nutrition, body insights, and progress in one focused fitness experience.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geist.variable} ${geistMono.variable} ${outfit.variable} antialiased`}>
        <QueryProvider>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </QueryProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
