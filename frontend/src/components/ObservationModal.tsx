// frontend/src/components/ObservationModal.tsx
import React, { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import ShadcnDynamicForm from "./ShadcnDynamicForm";
import { Observation } from "../types/observation";
import { FormField } from "../types/form";
import { createObservation, updateObservation } from "../lib/observation";
import { useUser } from "./UserProvider";
import { ScrollArea } from "./ui/scroll-area";

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onObservationUpserted: () => void;
  mode: "add" | "edit";
  observation?: Observation | null;
}

const observationFormSchema = z.object({
  speciesName: z.string().min(1, "Species name is required"),
  commonName: z.string().nullable().optional(),
  locationName: z.string().min(1, "Location name is required"),
  latitude: z.preprocess((val) => Number(val), z.number().min(-90).max(90)),
  longitude: z.preprocess((val) => Number(val), z.number().min(-180).max(180)),
  observationDatetime: z
    .string()
    .min(1, "Observation date and time is required"),
  depthMin: z
    .preprocess(
      (val) => (val === "" ? null : Number(val)),
      z.number().nullable(),
    )
    .optional(),
  depthMax: z
    .preprocess(
      (val) => (val === "" ? null : Number(val)),
      z.number().nullable(),
    )
    .optional(),
  bathymetry: z
    .preprocess(
      (val) => (val === "" ? null : Number(val)),
      z.number().nullable(),
    )
    .optional(),
  temperature: z
    .preprocess(
      (val) => (val === "" ? null : Number(val)),
      z.number().nullable(),
    )
    .optional(),
  visibility: z
    .preprocess(
      (val) => (val === "" ? null : Number(val)),
      z.number().nullable(),
    )
    .optional(),
  notes: z.string().nullable().optional(),
  sex: z.enum(["male", "female", "unknown"]).nullable().optional(),
});

type ObservationFormData = z.infer<typeof observationFormSchema>;

const observationFormFields: FormField[] = [
  { name: "speciesName", label: "Species Name", type: "text" },
  { name: "commonName", label: "Common Name", type: "text", optional: true },
  { name: "locationName", label: "Location Name", type: "text" },
  {
    name: "latitude",
    label: "Latitude",
    type: "number",
    placeholder: "e.g., 34.05",
  },
  {
    name: "longitude",
    label: "Longitude",
    type: "number",
    placeholder: "e.g., -118.25",
  },
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

export default function ObservationModal({
  isOpen,
  onClose,
  onObservationUpserted,
  mode,
  observation,
}: ObservationModalProps) {
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState<
    Partial<ObservationFormData> | undefined
  >(undefined);

  useEffect(() => {
    if (mode === "edit" && observation) {
      setDefaultValues({
        speciesName: observation.speciesName,
        commonName: observation.commonName ?? undefined,
        locationName: observation.locationName,
        latitude: observation.location.coordinates[1],
        longitude: observation.location.coordinates[0],
        observationDatetime: observation.observationDatetime
          ? new Date(observation.observationDatetime)
              .toISOString()
              .substring(0, 16)
          : undefined,
        depthMin: observation.depthMin ?? undefined,
        depthMax: observation.depthMax ?? undefined,
        bathymetry: observation.bathymetry ?? undefined,
        temperature: observation.temperature ?? undefined,
        visibility: observation.visibility ?? undefined,
        notes: observation.notes ?? undefined,
        sex: observation.sex ?? undefined,
      });
    } else {
      setDefaultValues({
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
        sex: "unknown",
      });
    }
  }, [mode, observation, isOpen]);

  const onSubmit = async (data: z.infer<typeof observationFormSchema>) => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }
    if (mode === "edit" && !observation) {
      setError("No observation selected for editing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "edit" && observation) {
        const updatedObservationData = {
          speciesName: data.speciesName,
          commonName: data.commonName ?? null,
          locationName: data.locationName,
          location: {
            type: "Point" as const,
            coordinates: [data.longitude, data.latitude] as [number, number],
          },
          observationDatetime: data.observationDatetime
            ? new Date(data.observationDatetime).toISOString()
            : undefined,
          depthMin: data.depthMin ?? null,
          depthMax: data.depthMax ?? null,
          bathymetry: data.bathymetry ?? null,
          temperature: data.temperature ?? null,
          visibility: data.visibility ?? null,
          notes: data.notes ?? null,
          sex: data.sex ?? "unknown",
        };
        await updateObservation(observation.id, updatedObservationData);
      } else {
        const newObservationData = {
          speciesName: data.speciesName,
          commonName: data.commonName ?? null,
          locationName: data.locationName,
          latitude: data.latitude,
          longitude: data.longitude,
          observationDatetime: new Date(data.observationDatetime).toISOString(),
          depthMin: data.depthMin ?? null,
          depthMax: data.depthMax ?? null,
          bathymetry: data.bathymetry ?? null,
          temperature: data.temperature ?? null,
          visibility: data.visibility ?? null,
          notes: data.notes ?? null,
          sex: data.sex ?? "unknown",
          userId: user.id,
          username: user.username,
        };
        await createObservation(newObservationData);
      }
      onObservationUpserted();
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`ObservationModal: Failed to ${mode} observation:`, err);
      setError(`Failed to ${mode} observation. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const dialogTitle =
    mode === "add" ? "Add New Observation" : "Edit Observation";
  const dialogDescription =
    mode === "add"
      ? "Fill in the details for your new marine species observation."
      : "Make changes to your observation here. Click save when you're done.";
  const submitButtonText =
    mode === "add" ? "Create Observation" : "Save Changes";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[90vh] w-[90vw] max-w-md flex flex-col p-0 z-[1050]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-6 overflow-y-auto">
          {(mode === "add" || (mode === "edit" && observation)) && (
            <ShadcnDynamicForm
              schema={observationFormSchema}
              fields={observationFormFields}
              onSubmit={onSubmit}
              submitButtonText={submitButtonText}
              formTitle=""
              error={error}
              loading={loading}
              defaultValues={defaultValues}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
