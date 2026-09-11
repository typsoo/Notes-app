import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

import { ThemeProvider } from "@/components/common/theme-provider";
import { NavLinkScript } from "@/components/scripts/nav-link";

import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  title: "Notes App",
  description: "Personal notes management application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <AppLayout>{children}</AppLayout>
          </TRPCReactProvider>
          <NavLinkScript />
        </ThemeProvider>
      </body>
    </html>
  );
}
