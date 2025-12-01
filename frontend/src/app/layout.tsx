import "../styles/globals.css";
import React from "react";
import { UserProvider } from "../components/UserProvider";
import AppContent from "./AppContent";
import { LoadingProvider, useLoading } from '../hooks/useLoading';
import Loader from '../components/Loader';
import { Inter } from "next/font/google";
import GlobalLoader from '../components/GlobalLoader';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Marine Species Observation Tracker",
  description: "Track and explore marine species observations",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <LoadingProvider>
            <AppContent>
              {children}
            </AppContent>
            <GlobalLoader />
          </LoadingProvider>
        </UserProvider>
      </body>
    </html>
  );
}
