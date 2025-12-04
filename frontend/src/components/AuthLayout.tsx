// src/app/components/AuthLayout.tsx

"use client";

import React from "react";
import LiquidChrome from "./LiquidChrome";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <LiquidChrome />
      </div>

      {/* Centered auth box */}
      <div className="flex justify-center items-center min-h-screen px-4">
        {children}
      </div>
    </div>
  );
}
