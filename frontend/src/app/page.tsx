import dynamic from "next/dynamic";
import ClientHomeControls from "./ClientHomeControls";

export const metadata = {
  title: "Marine Species Observation Tracker",
  description: "Track and explore marine species observations",
  icons: {
    icon: "/favicon.ico",
  },
};

const DynamicMapComponent = dynamic(
  () => import("../components/MapComponent"),
  { ssr: false },
);
export default function Home() {
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
