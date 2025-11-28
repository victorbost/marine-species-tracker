// frontend/src/types/geojson.ts

export interface GeoJsonFeatureProperties {
  id: number;
  species_name: string;
  common_name?: string;
  observation_datetime: string;
  location_name: string;
  source: "user" | "obis" | "other";
}

export interface GeoJsonFeature {
  type: "Feature";
  properties: GeoJsonFeatureProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}
