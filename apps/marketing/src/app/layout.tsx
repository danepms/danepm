import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dane — Property Management, Simplified",
  description: "The modern platform for property managers and owners. Track rent, manage tenants, automate communications, and grow your portfolio — all from one dashboard.",
  keywords: ["property management", "rental management", "tenant management", "rent collection", "Kenya", "Nairobi", "real estate"],
  openGraph: {
    title: "Dane — Property Management, Simplified",
    description: "The modern platform for property managers and owners. Track rent, manage tenants, automate communications, and grow your portfolio.",
    type: "website",
    url: "https://danesproperties.com",
    siteName: "Dane",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dane — Property Management, Simplified",
    description: "The modern platform for property managers and owners.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased noise-overlay">
        {children}
      </body>
    </html>
  );
}
