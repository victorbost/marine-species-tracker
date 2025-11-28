import "../styles/globals.css";
import React from "react";
import { UserProvider } from "../components/UserProvider";
import AppContent from "./AppContent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <UserProvider>
        <body>
          <AppContent>{children}</AppContent>
        </body>
      </UserProvider>
    </html>
  );
}
