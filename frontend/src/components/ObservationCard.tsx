import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Observation } from "../types/observation";

interface ObservationCardProps {
  observation: Observation;
  onSelectObservation: (observation: Observation) => void;
  onDeleteObservation: (observationId: number) => void;
  onEditObservationClick: (observation: Observation) => void;
}

function ObservationCard({
  observation,
  onSelectObservation,
  onDeleteObservation,
  onEditObservationClick,
}: ObservationCardProps) {
  return (
    <Card
      className="rounded-xl border text-card-foreground shadow w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => onSelectObservation(observation)}
    >
      <CardHeader>
        <CardTitle>{observation.speciesName}</CardTitle>
        {observation.commonName && (
          <p className="text-sm text-muted-foreground">
            {observation.commonName}
          </p>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {observation.image && (
          <div className="relative h-48 w-full">
            <Image
              src={observation.image}
              alt={observation.speciesName}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        )}
        <div className="flex items-center space-x-4 rounded-md border p-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Location: {observation.locationName}
            </p>
            <p className="text-sm text-muted-foreground">
              Date: {format(new Date(observation.observationDatetime), "PPP p")}
            </p>
            {observation.depthMin !== null && observation.depthMax !== null && (
              <p className="text-sm text-muted-foreground">
                Depth: {observation.depthMin}m - {observation.depthMax}m
              </p>
            )}
            {observation.bathymetry !== null && (
              <p className="text-sm text-muted-foreground">
                Bathymetry: {observation.bathymetry}m
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Temperature: {observation.temperature}°C
            </p>
            <p className="text-sm text-muted-foreground">
              Visibility: {observation.visibility}m
            </p>
            {observation.sex && observation.sex !== "unknown" && (
              <p className="text-sm text-muted-foreground">
                Sex: {observation.sex}
              </p>
            )}
            {observation.notes && (
              <p className="text-sm text-muted-foreground">
                Notes: {observation.notes}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Status: {observation.validated}
            </p>
            <p className="text-sm text-muted-foreground">
              Source: {observation.source}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="edit"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditObservationClick(observation);
            }}
          >
            Edit
          </Button>
          <Button
            variant="delete"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteObservation(observation.id);
            }}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { ObservationCard };
