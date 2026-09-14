import { Geist, Martian_Mono } from "next/font/google";

export const martianMono = Martian_Mono({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-martian-mono",
  display: "swap",
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
