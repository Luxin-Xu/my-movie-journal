import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PITATEE's Movie Journal",
  description: "A private movie journal for recent watches, ratings, and posters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#050607]">{children}</body>
    </html>
  );
}
