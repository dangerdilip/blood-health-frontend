"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Activity } from "lucide-react";
import DashboardUI from "./DashboardUI";
import { ThemeToggle } from "../../components/ThemeToggle";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Dashboard Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">Blood Health</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                Sign In to Save Data
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Main Dashboard UI */}
      <div className="pt-24 pb-12">
        <DashboardUI />
      </div>
    </div>
  );
}
