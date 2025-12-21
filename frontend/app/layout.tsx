import type { Metadata } from "next";
// import { Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";

// const outfit = Outfit({
//   subsets: ["latin"],
//   variable: "--font-sans",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "Plant Disease Detector",
  description: "AI-powered diagnostics for your plants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4ADE80" />
      </head>
      {/* <body className={`${outfit.variable} antialiased text-slate-200 font-sans`}> */}
      <body className={`antialiased text-slate-200 font-sans`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
