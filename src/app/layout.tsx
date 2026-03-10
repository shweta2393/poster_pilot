import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PosterPilot — AI-Powered Poster & Ad Creator",
  description:
    "Create stunning posters, social media graphics, and digital advertisements with AI-powered design assistance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas-bg text-canvas-text antialiased">
        {children}
      </body>
    </html>
  );
}
