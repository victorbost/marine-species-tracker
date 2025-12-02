// frontend/src/app/page.tsx

"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useLoading } from "../hooks/useLoading";
import UserObservationSection from "../components/UserObservationSection";

export default function Home() {
  const { startLoading, stopLoading } = useLoading();
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      startLoading();
      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
        setData("Data loaded successfully!");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch data:", error);
        setData("Failed to load data.");
      } finally {
        stopLoading();
      }
    };

    fetchData();
  }, [startLoading, stopLoading]);

  return (
    <main className="h-screen bg-kerama-depth flex flex-col">
      <div className="mx-auto max-w-[1440px] h-full max-h-[1076px] w-full p-4">
        <UserObservationSection className="h-full" />
          </div>
    </main>
  );
}
