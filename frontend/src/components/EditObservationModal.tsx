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
import { Observation } from "../types/observation";
import { FormField } from "../types/form";
import { updateObservation } from "../lib/observation";
import { useUser } from "./UserProvider";
import { ScrollArea } from "./ui/scroll-area";

interface EditObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  observation: Observation | null;
  onObservationUpdated: () => void;
}

const observationFormSchema = z.object({
  speciesName: z.string().min(1, "Species name is required"),
  commonName: z.string().nullable(),
  locationName: z.string().min(1, "Location name is required"),
  observationDatetime: z
    .string()
    .min(1, "Observation date and time is required"),
  depthMin: z.preprocess((val) => Number(val), z.number().nullable()),
  depthMax: z.preprocess((val) => Number(val), z.number().nullable()),
  bathymetry: z.preprocess((val) => Number(val), z.number().nullable()),
  temperature: z.preprocess((val) => Number(val), z.number().nullable()),
  visibility: z.preprocess((val) => Number(val), z.number().nullable()),
  notes: z.string().nullable(),
  sex: z.enum(["male", "female", "unknown"]).nullable(),
});

const observationFormFields: FormField[] = [
  { name: "speciesName", label: "Species Name", type: "text" },
  { name: "commonName", label: "Common Name", type: "text", optional: true },
  { name: "locationName", label: "Location Name", type: "text" },
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

export default function EditObservationModal({
  isOpen,
  onClose,
  observation,
  onObservationUpdated,
}: EditObservationModalProps) {
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof observationFormSchema>) => {
    if (!user || !observation) {
      setError("User not authenticated or no observation selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedObservationData = {
        ...data,
        observationDatetime: data.observationDatetime
          ? new Date(data.observationDatetime).toISOString()
          : undefined,
        id: observation.id,
        location: observation.location,
        user: observation.user,
        validated: observation.validated,
        source: observation.source,
        // Handle image if you add image upload later
      };

      await updateObservation(observation.id, updatedObservationData);
      onObservationUpdated();
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("EditObservationModal: Failed to update observation:", err);
    } finally {
      setLoading(false);
    }
  };

  const defaultValues = observation
    ? {
        speciesName: observation.speciesName,
        commonName: observation.commonName ?? undefined,
        locationName: observation.locationName,
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
      }
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[90vh] w-[90vw] max-w-md flex flex-col p-0 z-[1050]">
        {" "}
        {/* Adjusted className */}
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Edit Observation</DialogTitle>
          <DialogDescription>
            Make changes to your observation here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-6 overflow-y-auto">
          {observation && (
            <ShadcnDynamicForm
              schema={observationFormSchema}
              fields={observationFormFields}
              onSubmit={onSubmit}
              submitButtonText="Save Changes"
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
