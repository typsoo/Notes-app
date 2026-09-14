import "@/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";

import { ThemeProvider } from "@/components/common/theme-provider";
import { NavLinkScript } from "@/components/scripts/nav-link";
import { martianMono, geistSans } from "./fonts";

export const metadata: Metadata = {
  title: "Notes App",
  description: "Personal notes management application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${martianMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <NavLinkScript />
        </ThemeProvider>
      </body>
    </html>
  );
}
