import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "@workspace/ui/globals.css";
import { BottomNavigation } from "@/components/layout/bottom-nav";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@workspace/ui/components/toaster";
import type { Metadata, Viewport } from "next";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MBG Platform",
  description: "Platform Vendor Makan Bergizi Gratis Indonesia",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MBG Platform",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <main className="flex-1 pb-20 overflow-x-hidden">
            {children}
          </main>
          <BottomNavigation />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

