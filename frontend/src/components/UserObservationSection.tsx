// frontend/src/components/UserObservationSection.tsx

"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useUser } from "./UserProvider";
import { ObservationCard } from "./ObservationCard";
import { fetchUserObservations } from "../lib/observation";
import { Observation } from "../types/observation";
import Loader from "./Loader";

interface UserObservationSectionProps {
  className?: string;
}

const DynamicMapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

const renderObservationListContent = (
  isLoading: boolean,
  error: string | null,
  observations: Observation[],
  onSelectObservation: (observation: Observation) => void,
) => {
  if (isLoading) {
    return <Loader isLoading />;
  }
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }
  if (observations.length === 0) {
    return (
      <p className="p-4">No observations found. Start by adding a new one!</p>
    );
  }
  return observations.map((observation: Observation) => (
    <ObservationCard
      key={observation.id}
      observation={observation}
      onSelectObservation={onSelectObservation}
    />
  ));
};

function UserObservationSection({ className }: UserObservationSectionProps) {
  const { user, loading: isUserLoading } = useUser();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObservation, setSelectedObservation] =
    useState<Observation | null>(null);

  useEffect(() => {
    const loadObservations = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const userObservations = await fetchUserObservations();
        setObservations(userObservations);
      } catch (err) {
        const errorMessage = "Failed to load observations.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isUserLoading) {
      loadObservations();
    }
  }, [user, isUserLoading]);

  const handleSelectObservation = (observation: Observation) => {
    setSelectedObservation(observation);
  };

  if (isUserLoading) {
    return (
      <section id="user-observations" className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-6">Your Observations</h2>
        <Loader isLoading />
        <p className="text-center mt-4">Loading user data...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section id="user-observations" className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-6">Your Observations</h2>
        <p>Please log in to view your observations.</p>
      </section>
    );
  }

  return (
    <div
      className={cn(
        "border rounded-lg bg-white p-2 grid grid-cols-1 md:grid-cols-3 w-full h-full overflow-hidden",
        className,
      )}
    >
      <div className="md:col-span-2 h-full">
        <div
          style={{ position: "relative" }}
          className="h-full bg-white rounded-lg overflow-hidden"
        >
          <DynamicMapComponent selectedObservation={selectedObservation} />
          {/* <div className="absolute bottom-4 left-4 z-10">
            <Button>+ Add Observation</Button>
          </div> */}
        </div>
      </div>
      <div className="md:col-span-1 h-full flex flex-col overflow-hidden">
        <Card className="rounded-none shadow-none border-none flex-grow flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Observations ({observations.length})
              <Badge variant="secondary">All public observations</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {renderObservationListContent(
                isLoading,
                error,
                observations,
                handleSelectObservation,
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserObservationSection;
