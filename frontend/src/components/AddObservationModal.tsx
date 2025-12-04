// frontend/src/components/AddObservationModal.tsx
import React, { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import ShadcnDynamicForm from "./ShadcnDynamicForm";
import { FormField } from "../types/form";
import { createObservation } from "../lib/observation";
import { useUser } from "./UserProvider";
import { ScrollArea } from "./ui/scroll-area";
import { Observation } from "../types/observation";

interface AddObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onObservationCreated: () => void;
}

const addObservationFormSchema = z.object({
  speciesName: z.string().min(1, "Species name is required"),
  commonName: z.string().nullable().optional(),
  locationName: z.string().min(1, "Location name is required"),
  latitude: z.preprocess((val) => Number(val), z.number().min(-90).max(90)),
  longitude: z.preprocess((val) => Number(val), z.number().min(-180).max(180)),
  observationDatetime: z
    .string()
    .min(1, "Observation date and time is required"),
  depthMin: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable()).optional(),
  depthMax: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable()).optional(),
  bathymetry: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable()).optional(),
  temperature: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable()).optional(),
  visibility: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable()).optional(),
  notes: z.string().nullable().optional(),
  sex: z.enum(["male", "female", "unknown"]).nullable().optional(),
});

const addObservationFormFields: FormField[] = [
  { name: "speciesName", label: "Species Name", type: "text" },
  { name: "commonName", label: "Common Name", type: "text", optional: true },
  { name: "locationName", label: "Location Name", type: "text" },
  { name: "latitude", label: "Latitude", type: "number", placeholder: "e.g., 34.05" },
  { name: "longitude", label: "Longitude", type: "number", placeholder: "e.g., -118.25" },
  {
    name: "observationDatetime",
    label: "Observation Date/Time",
    type: "datetime-local",
  },
  {
    name: "depthMin",
    label: "Minimum Depth (m)",
    type: "number",
    optional: true,
  },
  {
    name: "depthMax",
    label: "Maximum Depth (m)",
    type: "number",
    optional: true,
  },
  {
    name: "bathymetry",
    label: "Bathymetry (m)",
    type: "number",
    optional: true,
  },
  {
    name: "temperature",
    label: "Temperature (°C)",
    type: "number",
    optional: true,
  },
  {
    name: "visibility",
    label: "Visibility (m)",
    type: "number",
    optional: true,
  },
  { name: "notes", label: "Notes", type: "textarea", optional: true },
  {
    name: "sex",
    label: "Sex",
    type: "select",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "unknown", label: "Unknown" },
    ],
    optional: true,
  },
];

export default function AddObservationModal({
  isOpen,
  onClose,
  onObservationCreated,
}: AddObservationModalProps) {
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof addObservationFormSchema>) => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newObservationData: Omit<
        Observation,
        "id" | "createdAt" | "updatedAt" | "image" | "location"
      > & { latitude: number; longitude: number } = {
        speciesName: data.speciesName,
        commonName: data.commonName ?? null,
        locationName: data.locationName,
        latitude: data.latitude,
        longitude: data.longitude,
        observationDatetime: new Date(data.observationDatetime).toISOString(),
        depthMin: (data as any).depthMin ?? null,
        depthMax: (data as any).depthMax ?? null,
        bathymetry: (data as any).bathymetry ?? null,
        temperature: (data as any).temperature ?? null,
        visibility: (data as any).visibility ?? null,
        notes: data.notes ?? null,
        sex: data.sex ?? null,
        user: user.id,
      };

      await createObservation(newObservationData);

      onObservationCreated();
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("AddObservationModal: Failed to create observation:", err);
      setError("Failed to create observation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const defaultValues = {
    speciesName: "",
    commonName: undefined,
    locationName: "",
    latitude: 0,
    longitude: 0,
    observationDatetime: new Date().toISOString().substring(0, 16),
    depthMin: undefined,
    depthMax: undefined,
    bathymetry: undefined,
    temperature: undefined,
    visibility: undefined,
    notes: undefined,
    sex: undefined,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Ensure DialogContent has max-height and flex-col for ScrollArea to work correctly */}
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[90vh] w-[90vw] max-w-md flex flex-col p-0 z-[1050]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Add New Observation</DialogTitle>
          <DialogDescription>
            Fill in the details for your new marine species observation.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 overflow-y-auto">
          <ShadcnDynamicForm
            schema={addObservationFormSchema}
            fields={addObservationFormFields}
            onSubmit={onSubmit}
            submitButtonText="Create Observation"
            formTitle=""
            error={error}
            loading={loading}
            defaultValues={defaultValues}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
