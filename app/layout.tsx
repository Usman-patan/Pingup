import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // turbo
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "PingUp",
  description: "Connect & Chat Naturally",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ConvexClientProvider>
          <TooltipProvider delayDuration={0}>
            {children}
          </TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
