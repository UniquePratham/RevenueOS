import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RevenueOS — The Autonomous Merchant Revenue Engine",
  description: "Autonomous AI operating system for merchants that continuously discovers revenue opportunities, enables AI buyers to transact, protects transactions from risk, recovers failed revenue, and reconciles financial state.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F5EFE2] text-[#141413] font-sans antialiased selection:bg-[#EB001B] selection:text-white">
        {children}
      </body>
    </html>
  );
}
