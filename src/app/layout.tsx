import type { Metadata } from "next";
import { DM_Serif_Display, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Nav";
import { ToastProvider } from "./components/ui";

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  weight: ["400"],
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Last Page",
  description: "A book tracker for book lovers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${dmSerifDisplay.variable} ${jetBrainsMono.variable} antialiased`}>
        <ToastProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
