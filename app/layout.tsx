import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blood Health Risk Analyzer — ML-Powered CBC Analysis",
  description:
    "Clinical decision support system that analyzes Complete Blood Count records using machine learning to predict blood health deterioration risk.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClerkProvider>
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
