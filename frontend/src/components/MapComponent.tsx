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
  selectedObservation,
  zIndex,
  zoomTrigger,
  mapRefreshTrigger,
}: MapComponentProps) {
  // Make sure selectedObservation is destructured
  const defaultPosition: [number, number] = [0, 0];
  const [allMapObservations, setAllMapObservations] = useState<
    GeoJsonFeature[]
  >([]);
  const [isMounted, setIsMounted] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && selectedObservation) {
      const [lng, lat] = selectedObservation.location.coordinates;
      mapRef.current.flyTo([lat, lng], 4);
    }
  }, [selectedObservation, zoomTrigger]);

  useEffect(() => {
    if (mapRef.current && selectedObservation) {
      const [lng, lat] = selectedObservation.location.coordinates;
      mapRef.current.flyTo([lat, lng], 4);
    }
  }, [selectedObservation, zoomTrigger]);

  const loadAllMapObservations = useCallback(async () => {
    // Renamed function for clarity
    try {
      const data = await fetchMapObservations();
      setAllMapObservations(data.features);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch all map observations:", error);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadAllMapObservations();
  }, [loadAllMapObservations, mapRefreshTrigger]);

  if (!isMounted) {
    return null;
  }
  const allObservations = allMapObservations;

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
