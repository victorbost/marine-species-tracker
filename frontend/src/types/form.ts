// frontend/src/types/form.ts
import { z } from "zod";
import { FieldValues } from "react-hook-form";

export type ShadcnFormFieldType =
  | "text"
  | "email"
  | "password"
  | "select"
  | "number"
  | "date"
  | "textarea";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: ShadcnFormFieldType;
  placeholder?: string;
  description?: string;
  options?: FormFieldOption[];
}

export interface DynamicFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T, any>;
  fields: FormField[];
  onSubmit: (values: T) => Promise<void>;
  submitButtonText: string;
  formTitle: string;
  error?: string;
  loading?: boolean;
  linkText?: string;
  linkHref?: string;
}
