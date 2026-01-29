import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Progress - Sprint Dashboard",
  description: "Project management dashboard for sprint tracking and delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

