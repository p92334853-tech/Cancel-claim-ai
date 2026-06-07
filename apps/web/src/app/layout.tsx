import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: "Cancel & Claim AI — Cancel subscriptions, claim refunds, win disputes",
    template: "%s · Cancel & Claim AI",
  },
  description:
    "A premium AI assistant that helps you cancel subscriptions, request refunds, prepare chargebacks, and write complaints and appeals — from problem to ready-to-send action pack in minutes.",
  keywords: [
    "cancel subscription",
    "request a refund",
    "chargeback letter",
    "dispute a charge",
    "complaint letter",
    "appeal letter",
    "refund email template",
  ],
  applicationName: "Cancel & Claim AI",
  openGraph: {
    type: "website",
    siteName: "Cancel & Claim AI",
    title: "Cancel & Claim AI",
    description: "Recover money and end unwanted charges — problem to action pack in minutes.",
    url: config.siteUrl,
  },
  twitter: { card: "summary_large_image", title: "Cancel & Claim AI" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
