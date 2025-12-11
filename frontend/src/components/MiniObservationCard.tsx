// frontend/src/components/MiniObservationCard.tsx
import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Observation } from "../types/observation";
import { formatDepth } from "../lib/utils";

interface MiniObservationCardProps {
  observation: Observation;
}

function MiniObservationCard({ observation }: MiniObservationCardProps) {
  const isUserObservation = observation.source === "user";

  return (
    <div className="p-2 text-sm custom-popup-paragraph-margin">
      <h3>
        <strong className="font-bold">{observation.speciesName}</strong>{" "}
        {observation.commonName && (
          <span className="text-muted-foreground">
            ({observation.commonName})
          </span>
        )}
      </h3>

      {isUserObservation && observation.username && (
        <p className="my-1">Observed by: {observation.username}</p>
      )}

      {observation.image && (
        <div className="relative h-24 w-full my-2">
          <Image
            src={observation.image}
            alt={observation.speciesName}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
            loading="lazy"
          />
        </div>
      )}
      {isUserObservation && <p>Location: {observation.locationName}</p>}
      <p>Date: {format(new Date(observation.observationDatetime), "PPP p")}</p>
      {observation.depthMin !== null && observation.depthMax !== null && (
        <p>Depth: {formatDepth(observation.depthMin, observation.depthMax)}</p>
      )}
      {observation.bathymetry !== null && (
        <p>Bathymetry: {observation.bathymetry}m</p>
      )}
      {observation.temperature !== null && (
        <p>Temperature: {observation.temperature}°C</p>
      )}
      {observation.visibility !== null && (
        <p>Visibility: {observation.visibility}m</p>
      )}
      {observation.sex && <p>Sex: {observation.sex}</p>}
      {observation.notes && <p>Notes: {observation.notes}</p>}
      <p>Source: {observation.source}</p>
    </div>
  );
}

export { MiniObservationCard };
