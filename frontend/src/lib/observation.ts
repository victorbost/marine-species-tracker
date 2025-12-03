import { api } from "./api";
import { Observation } from "../types/observation";
import { GeoJsonFeatureCollection, PaginatedGeoJsonFeatures } from "../types/geojson";

export async function fetchUserObservations(): Promise<Observation[]> {
  try {
    // The API response is a PaginatedGeoJsonFeatures
    const response =
      await api.get<PaginatedGeoJsonFeatures>("v1/observations/");
    const geoJsonFeatures = response.data.results.features;

    // Map the GeoJSON features into the frontend's Observation type
    const observations: Observation[] = geoJsonFeatures.map((feature) => ({
      id: feature.id,
      user: feature.properties.user,
      speciesName: feature.properties.speciesName,
      commonName: feature.properties.commonName ?? null,
      location: feature.geometry,
      observationDatetime: feature.properties.observationDatetime,
      locationName: feature.properties.locationName,
      depthMin: feature.properties.depthMin ?? null,
      depthMax: feature.properties.depthMax ?? null,
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

export async function updateObservation(
  observationId: number,
  observationData: Partial<Observation>,
): Promise<Observation> {
  try {
    const response = await api.patch<Observation>(
      `v1/observations/${observationId}/`,
      observationData,
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `observation.ts (updateObservation): Error updating observation ${observationId}:`,
      error,
    );
    throw error;
  }
}

export async function createObservation(
  observationData: Omit<
    Observation,
    "id" | "createdAt" | "updatedAt" | "image" | "location" | "source" | "validated"
  > & { latitude: number; longitude: number },
): Promise<Observation> {
  const { latitude, longitude, ...rest } = observationData;

  const dataToSend = {
    ...rest,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  };

  try {
    const response = await api.post<Observation>(
      `v1/observations/`,
      dataToSend,
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to create observation:", error);
    throw error;
  }
}

export async function fetchMapObservations(): Promise<GeoJsonFeatureCollection> {
  try {
    const response = await api.get<PaginatedGeoJsonFeatures>( // Assuming map endpoint returns PaginatedGeoJsonFeatures
      "v1/map/observations/?lat=0&lng=0&radius=10000",
    );
    // The map endpoint typically returns a GeoJsonFeatureCollection directly,
    // but if it's wrapped in PaginatedGeoJsonFeatures, we extract features.
    return response.data.results; // Assuming data structure matches PaginatedGeoJsonFeatures
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching map observations:", error);
    throw error;
  }
}
