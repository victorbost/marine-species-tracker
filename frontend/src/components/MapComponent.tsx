// frontend/src/app/MapComponent.tsx

"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect, useRef, useCallback } from "react";
import { GeoJsonFeature, GeoJsonFeatureCollection } from "../types/geojson";

import { Observation } from "../types/observation";
import { fetchMapObservations } from "../lib/observation"; // Import the new function

interface MapComponentProps {
  userObservations: Observation[];
  selectedObservation: Observation | null;
  zIndex?: number;
  zoomTrigger: number;
  mapRefreshTrigger: number; // New prop for triggering refresh
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Keep if still used elsewhere, otherwise can be removed
export default function MapComponent({
  userObservations,
  selectedObservation,
  zIndex,
  zoomTrigger,
  mapRefreshTrigger, // Destructure the new prop
}: MapComponentProps) {
  console.log("MapComponent rendered. Received mapRefreshTrigger:", mapRefreshTrigger); // eslint-disable-line no-console

  // Make sure selectedObservation is destructured
  const defaultPosition: [number, number] = [0, 0];
  const [obisObservations, setObisObservations] = useState<GeoJsonFeature[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && selectedObservation) {
      const [lng, lat] = selectedObservation.location.coordinates;
      mapRef.current.flyTo([lat, lng], 4);
    }
  }, [selectedObservation, zoomTrigger]);

  const loadMapObservations = useCallback(async () => { // Renamed for clarity
    console.log("loadMapObservations function called."); // eslint-disable-line no-console
    try {
      const data = await fetchMapObservations(); // Use the new lib function
      console.log("Fetched observations data:", data.features); // eslint-disable-line no-console
      setObisObservations(data.features.filter(f => f.properties.source?.toLowerCase() === 'obis'));
    } catch (error) {
      console.error("Failed to fetch observations for map:", error); // eslint-disable-line no-console
    }
  }, []);  // Empty dependency array because fetchMapObservations doesn't depend on local state/props

  useEffect(() => {
    console.log("MapComponent useEffect for data fetching is running. mapRefreshTrigger:", mapRefreshTrigger); // eslint-disable-line no-console
    setIsMounted(true);
    loadMapObservations(); // Call the new load function
  }, [loadMapObservations, mapRefreshTrigger]); // Add mapRefreshTrigger as a dependency

  if (!isMounted) {
    return null;
  }

  const allObservations = [
    ...obisObservations,
    ...userObservations.map(obs => ({
      id: `user-${obs.id}`,
      type: "Feature",
      properties: {
        // All properties from Observation need to be mapped to GeoJsonFeatureProperties
        id: obs.id,
        speciesName: obs.speciesName,
        commonName: obs.commonName ?? undefined,
        observationDatetime: obs.observationDatetime,
        locationName: obs.locationName,
        source: "user" as const, // Ensure source is correctly typed
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
    }))
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
          console.log("Rendering marker for feature ID:", feature.id, "Species:", feature.properties.speciesName); // eslint-disable-line no-console

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
