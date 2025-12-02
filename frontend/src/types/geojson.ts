export interface GeoJsonFeatureProperties {
  id: number;
  species_name: string;
  common_name?: string;
  observation_datetime: string;
  location_name: string;
  source: "user" | "obis" | "other";

  depth_min: number | null;
  depth_max: number | null;
  bathymetry: number | null;
  temperature: number;
  visibility: number;
  notes: string | null;
  image: string | null;
  validated: "pending" | "validated" | "rejected";
  sex: "male" | "female" | "unknown" | null;
  user: number; // User ID
  created_at: string;
  updated_at: string;
}

export interface GeoJsonFeature {
  id: number;
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

// New interface for the complete paginated API response
export interface PaginatedGeoJsonFeatures {
  count: number;
  next: string | null;
  previous: string | null;
  results: GeoJsonFeatureCollection; // The actual GeoJsonFeatureCollection is nested here
}
