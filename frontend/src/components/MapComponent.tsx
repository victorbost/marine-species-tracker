// frontend/src/app/MapComponent.tsx

"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect, useRef, useCallback } from "react";
import { GeoJsonFeature } from "../types/geojson";

import { Observation } from "../types/observation";
import { fetchMapObservations } from "../lib/observation";

interface MapComponentProps {
  userObservations: Observation[];
  selectedObservation: Observation | null;
  zIndex?: number;
  zoomTrigger: number;
  mapRefreshTrigger: number;
}

// Create a custom blue circle icon using L.divIcon
const blueIcon = L.divIcon({
  className: "custom-blue-marker",
  html: '<div style="background-color: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff;"></div>',
  iconSize: [16, 16], // Size of the icon
  iconAnchor: [8, 8], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -8], // Point from which the popup should open relative to the iconAnchor
});

const yellowIcon = L.divIcon({
  className: "custom-yellow-marker",
  html: '<div style="background-color: #FFD700; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff;"></div>',
  iconSize: [16, 16], // Size of the icon
  iconAnchor: [8, 8], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -8], // Point from which the popup should open relative to the iconAnchor
});

export default function MapComponent({
  userObservations,
  selectedObservation,
  zIndex,
  zoomTrigger,
  mapRefreshTrigger,
}: MapComponentProps) {
  // Make sure selectedObservation is destructured
  const defaultPosition: [number, number] = [0, 0];
  const [obisObservations, setObisObservations] = useState<GeoJsonFeature[]>(
    [],
  );
  const [isMounted, setIsMounted] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && selectedObservation) {
      const [lng, lat] = selectedObservation.location.coordinates;
      mapRef.current.flyTo([lat, lng], 4);
    }
  }, [selectedObservation, zoomTrigger]);

  const loadMapObservations = useCallback(async () => {
    // Renamed for clarity
    try {
      const data = await fetchMapObservations(); // Use the new lib function
      setObisObservations(
        data.features.filter(
          (f) => f.properties.source?.toLowerCase() === "obis",
        ),
      );
    } catch (error) {
      console.error("Failed to fetch observations for map:", error); // eslint-disable-line no-console
    }
  }, []); // Empty dependency array because fetchMapObservations doesn't depend on local state/props

  useEffect(() => {
    setIsMounted(true);
    loadMapObservations();
  }, [loadMapObservations, mapRefreshTrigger]);

  if (!isMounted) {
    return null;
  }

  const allObservations = [
    ...obisObservations,
    ...userObservations.map((obs) => ({
      id: `user-${obs.id}`,
      type: "Feature",
      properties: {
        id: obs.id,
        speciesName: obs.speciesName,
        commonName: obs.commonName ?? undefined,
        observationDatetime: obs.observationDatetime,
        locationName: obs.locationName,
        source: "user" as const,
        depthMin: obs.depthMin,
        depthMax: obs.depthMax,
        bathymetry: obs.bathymetry,
        temperature: obs.temperature,
        visibility: obs.visibility,
        notes: obs.notes,
        image: obs.image,
        validated: obs.validated,
        sex: obs.sex,
        user: obs.user,
        created_at: obs.createdAt,
        updated_at: obs.updatedAt,
      },
      geometry: obs.location,
    })),
  ];

  return (
    <MapContainer
      center={defaultPosition}
      zoom={2}
      scrollWheelZoom
      className="h-full w-full"
      style={{ zIndex }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {allObservations &&
        allObservations.length > 0 &&
        allObservations.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const {
            speciesName,
            commonName,
            observationDatetime,
            locationName,
            source,
          } = feature.properties;

          const markerIcon = source === "user" ? yellowIcon : blueIcon;

          return (
            <Marker key={feature.id} position={[lat, lng]} icon={markerIcon}>
              <Popup>
                <div>
                  <strong>{speciesName}</strong> (
                  {source === "obis" && commonName ? commonName : source})
                  <br />
                  {locationName && `Location: ${locationName}`}
                  <br />
                  {observationDatetime &&
                    `Observed: ${new Date(observationDatetime).toLocaleDateString()}`}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
