export interface Observation {
  id: number;
  user: number; // Assuming user ID is a number
  speciesName: string;
  commonName: string | null;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  observationDatetime: string; // ISO string format
  locationName: string;
  depthMin: number | null;
  depthMax: number | null;
  bathymetry: number | null;
  temperature: number | null;
  visibility: number | null;
  notes: string | null;
  image: string | null; // URL to the image
  validated: "pending" | "validated" | "rejected";
  source: "user" | "obis" | "other";
  sex: "male" | "female" | "unknown" | null;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}
