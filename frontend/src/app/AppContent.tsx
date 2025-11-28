"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "../components/Header";
import { useUser } from "../components/UserProvider";

export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const pathname = usePathname();

  const shouldShowHeader = !loading && user && pathname !== "/login";

  return (
    <>
      {shouldShowHeader && <Header />}
      {children}
    </>
  );
}
