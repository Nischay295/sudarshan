import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sudarshan",
  description: "AI-assisted accounting automation for Indian SMBs"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  );
}

