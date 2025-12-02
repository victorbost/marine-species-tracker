// frontend/src/components/UserObservationSection.tsx

"use client";

import dynamic from "next/dynamic";
import React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

const DynamicMapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

interface ObservationItemProps {
  speciesName: string;
  locationName: string;
  date: string;
  depth: number;
}

const ObservationItem: React.FC<ObservationItemProps> = ({
  speciesName,
  locationName,
  date,
  depth,
}) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold">{speciesName}</h3>
    <p className="text-sm text-gray-600">
      <span className="font-medium">Location:</span> {locationName}
    </p>
    <p className="text-sm text-gray-600">
      <span className="font-medium">Date:</span> {date}
    </p>
    <p className="text-sm text-gray-600">
      <span className="font-medium">Depth:</span> {depth}m
    </p>
    <div className="flex gap-2 mt-2">
      <Button variant="outline" size="sm">
        Edit
      </Button>
      <Button variant="destructive" size="sm">
        Delete
      </Button>
    </div>
    <Separator className="my-4" />
  </div>
);

export default function UserObservationSection({
  className,
}: {
  className?: string;
}) {
  const observations = [
    {
      id: "1",
      speciesName: "Whalenella robusta",
      locationName: "Gulf of Mexico",
      date: "10/18/2025",
      depth: 10,
    },
    {
      id: "2",
      speciesName: "Stenella frontalis",
      locationName: "Atlantic Ocean",
      date: "09/01/2025",
      depth: 5,
    },
    {
      id: "3",
      speciesName: "Chelonia mydas",
      locationName: "Pacific Ocean",
      date: "08/15/2025",
      depth: 15,
    },
    {
      id: "4",
      speciesName: "Orcinus orca",
      locationName: "Pacific Northwest",
      date: "07/20/2025",
      depth: 20,
    },
    {
      id: "5",
      speciesName: "Tursiops truncatus",
      locationName: "Mediterranean Sea",
      date: "06/10/2025",
      depth: 8,
    },
    {
      id: "6",
      speciesName: "Megaptera novaeangliae",
      locationName: "Antarctic Ocean",
      date: "05/01/2025",
      depth: 50,
    },
    {
      id: "7",
      speciesName: "Eschrichtius robustus",
      locationName: "Arctic Ocean",
      date: "04/22/2025",
      depth: 12,
    },
    {
      id: "8",
      speciesName: "Physeter macrocephalus",
      locationName: "Deep Ocean",
      date: "03/15/2025",
      depth: 1000,
    },
    {
      id: "9",
      speciesName: "Delphinus delphis",
      locationName: "Indian Ocean",
      date: "02/01/2025",
      depth: 7,
    },
    {
      id: "10",
      speciesName: "Globicephala melas",
      locationName: "North Sea",
      date: "01/10/2025",
      depth: 25,
    },
    {
      id: "11",
      speciesName: "Globicephala melas",
      locationName: "North Sea",
      date: "01/10/2025",
      depth: 25,
    },
    {
      id: "12",
      speciesName: "Globicephala melas",
      locationName: "North Sea",
      date: "01/10/2025",
      depth: 25,
    },
    {
      id: "13",
      speciesName: "Globicephala melas",
      locationName: "North Sea",
      date: "01/10/2025",
      depth: 25,
    },    {
      id: "14",
      speciesName: "Globicephala melas",
      locationName: "North Sea",
      date: "01/10/2025",
      depth: 25,
    },
  ];

  return (
    <div
      className={cn(
        "border rounded-lg bg-white p-2 grid grid-cols-1 md:grid-cols-3 w-full h-full overflow-hidden", // 'overflow-hidden' on the main wrapper
        className,
      )}
    >
      <div className="md:col-span-2 h-full">
        <div
          style={{ position: "relative" }}
          className="h-full bg-white rounded-lg overflow-hidden"
        >
          <DynamicMapComponent />
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
              {observations.map((observation) => (
                <ObservationItem
                  key={observation.id}
                  speciesName={observation.speciesName}
                  locationName={observation.locationName}
                  date={observation.date}
                  depth={observation.depth}
                />
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
