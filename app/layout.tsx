import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Preloader from "./components/Preloader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polling App — Real-time Polls with Passkey Security",
  description:
    "Create beautiful polls, share with your audience, and watch results come in real-time. Secure passwordless authentication with passkeys.",
  keywords: ["polls", "voting", "real-time", "passkey", "survey", "next.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}
      >
        <Preloader />
        <Navbar />
        <main style={{ paddingTop: "var(--navbar-height)" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
