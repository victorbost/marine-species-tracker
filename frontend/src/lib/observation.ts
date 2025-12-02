import { api } from "./api";
import { Observation } from "../types/observation";
import { PaginatedGeoJsonFeatures } from "../types/geojson";

export async function fetchUserObservations(): Promise<Observation[]> {
  try {
    // The API response is a PaginatedGeoJsonFeatures
    const response =
      await api.get<PaginatedGeoJsonFeatures>("v1/observations/");
    const geoJsonFeatures = response.data.results.features; // Directly access the array of features

    // Map the GeoJSON features into the frontend's Observation type
    const observations: Observation[] = geoJsonFeatures.map((feature) => ({
      id: feature.id,
      user: feature.properties.user,
      speciesName: feature.properties.species_name,
      commonName: feature.properties.common_name ?? null,
      location: feature.geometry,
      observationDatetime: feature.properties.observation_datetime,
      locationName: feature.properties.location_name,
      depthMin: feature.properties.depth_min ?? null,
      depthMax: feature.properties.depth_max ?? null,
      bathymetry: feature.properties.bathymetry ?? null,
      temperature: feature.properties.temperature,
      visibility: feature.properties.visibility,
      notes: feature.properties.notes ?? null,
      image: feature.properties.image ?? null,
      validated: feature.properties.validated,
      source: feature.properties.source,
      sex: feature.properties.sex ?? null,
      createdAt: feature.properties.created_at,
      updatedAt: feature.properties.updated_at,
    }));

    return observations;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching user observations:", error);
    throw error;
  }
}

export async function deleteObservation(observationId: number): Promise<void> {
  try {
    await api.delete(`v1/observations/${observationId}/`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error deleting observation ${observationId}:`, error);
    throw error;
  }
}
