import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { ChatButton } from "@/components/chat/ChatButton";

import "./globals.css";


const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AutoBid | Precision Engine Car Auctions",
  description: "Access exclusive automotive auctions. Precision-vetted inventory for the modern collector.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} font-body antialiased bg-surface text-on-surface`}
      >
        <Navbar />
        {children}
        <ChatButton />
      </body>

    </html>
  );
}

