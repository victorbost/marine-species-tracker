import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Observation } from "../types/observation";
import { formatDepth } from "../lib/utils";

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
  const getStatusTextColorClass = (status: Observation["validated"]) => {
    switch (status) {
      case "validated":
        return "text-semantic-success-500";
      case "pending":
        return "text-semantic-warning-500";
      case "rejected":
        return "text-semantic-error-500";
      default:
        return "text-muted-foreground";
    }
  };

  const statusTextColorClass = getStatusTextColorClass(observation.validated);

  const getStatusFillColorClass = (status: Observation["validated"]) => {
    switch (status) {
      case "validated":
        return "fill-semantic-success-500"; // Tailwind class for SVG fill
      case "pending":
        return "fill-semantic-warning-500"; // Tailwind class for SVG fill
      case "rejected":
        return "fill-semantic-error-500"; // Tailwind class for SVG fill
      default:
        return "fill-gray-400"; // Default fill color
    }
  };

  const statusFillColorClass = getStatusFillColorClass(observation.validated);

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
            {formatDepth(observation.depthMin, observation.depthMax) && (
              <p className="text-sm text-muted-foreground">
                Depth: {formatDepth(observation.depthMin, observation.depthMax)}
              </p>
            )}
            {observation.bathymetry !== null && (
              <p className="text-sm text-muted-foreground">
                Bathymetry: {observation.bathymetry}m
              </p>
            )}
            {observation.temperature !== null && (
              <p className="text-sm text-muted-foreground">
                Temperature: {observation.temperature}°C
              </p>
            )}
            {observation.visibility !== null && (
              <p className="text-sm text-muted-foreground">
                Visibility: {observation.visibility}m
              </p>
            )}
            {observation.sex && (
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
              Source: {observation.source}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <svg
              className={`h-5 w-5 ${statusFillColorClass}`}
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="8" />
            </svg>
            <span className={`text-sm ${statusTextColorClass}`}>
              {observation.validated.charAt(0).toUpperCase() +
                observation.validated.slice(1)}
            </span>
          </div>
          <div className="flex justify-end space-x-2">
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
        </div>
      </CardContent>
    </Card>
  );
}

export { ObservationCard };
