// frontend/src/app/MapComponent.tsx

"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";
import { GeoJsonFeature, GeoJsonFeatureCollection } from "../types/geojson";

import { Observation } from "../types/observation";

interface MapComponentProps {
  selectedObservation: Observation | null;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export default function MapComponent({
  selectedObservation,
}: MapComponentProps) {
  // Make sure selectedObservation is destructured
  const defaultPosition: [number, number] = [0, 0];
  const [observations, setObservations] = useState<GeoJsonFeature[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && selectedObservation) {
      const [lng, lat] = selectedObservation.location.coordinates;
      mapRef.current.flyTo([lat, lng], 6);
    }
  }, [selectedObservation]);

  useEffect(() => {
    setIsMounted(true);
    const fetchObservations = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/map/observations/?lat=0&lng=0&radius=10000`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GeoJsonFeatureCollection = await response.json();
        setObservations(data.features);
      } catch (error) {
        console.error("Failed to fetch observations:", error); // eslint-disable-line no-console
      }
    };

    fetchObservations();
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <MapContainer
      center={defaultPosition}
      zoom={2}
      scrollWheelZoom
      className="h-full w-full"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {observations &&
        observations.length > 0 &&
        observations.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates; // GeoJSON is [longitude, latitude]
          const {
            species_name,
            common_name,
            observation_datetime,
            location_name,
            source,
          } = feature.properties;

          const markerIcon = source === "user" ? yellowIcon : blueIcon;

          return (
            <Marker key={feature.id} position={[lat, lng]} icon={markerIcon}>
              <Popup>
                <div>
                  <strong>{species_name}</strong> (
                  {source === "obis" && common_name ? common_name : source})
                  <br />
                  {location_name && `Location: ${location_name}`}
                  <br />
                  {observation_datetime &&
                    `Observed: ${new Date(observation_datetime).toLocaleDateString()}`}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
