// frontend/src/app/page.tsx

"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import ClientHomeControls from "./ClientHomeControls";
import { useLoading } from "../hooks/useLoading";

const DynamicMapComponent = dynamic(
  () => import("../components/MapComponent"),
  { ssr: false },
);

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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center text-blue-900 mb-4">
          🌊 Marine Species Observation Tracker
        </h1>
        <p className="text-xl text-center text-blue-700 mb-8">
          Empower divers, biologists, and hobbyists...
        </p>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Your MVP!</h2>
          {data && <p className="text-lg text-center mb-4">{data}</p>}
          <div style={{ marginBottom: "20px" }}>
            {" "}
            <DynamicMapComponent />
          </div>
          <ClientHomeControls />
        </div>
      </div>
    </main>
  );
}
