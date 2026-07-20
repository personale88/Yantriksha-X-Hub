import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ChatbotWidget from "@/components/layout/ChatbotWidget";
import SplashPreloader from "@/components/layout/SplashPreloader";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yantriksha_X_Hub | Student Innovation & Startup Collaboration",
  description: "A Student-Driven Innovation and Cross-Disciplinary Collaboration Hub at Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology. Bridging Engineering, Law, and Business to turn ideas into startups.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 0.3,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=0.3, maximum-scale=5" />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <SplashPreloader />
        <div className="w-full flex-1 flex flex-col overflow-x-hidden relative">
          {children}
        </div>
        <ChatbotWidget />
      </body>
    </html>
  );
}
