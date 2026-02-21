import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raja Rani Chor Police - Multiplayer Card Game",
  description: "Play the classic Indian party game online with friends!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
