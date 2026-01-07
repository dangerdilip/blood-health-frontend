"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import DashboardUI from "./DashboardUI";

export default function DashboardPage() {
  return (
    <>
      <SignedIn>
        <DashboardUI />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
