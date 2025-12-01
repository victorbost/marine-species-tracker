// frontend/src/components/ShadcnDynamicForm.tsx

"use client";

import React from "react";
import {
  useForm,
  FieldPath,
  FieldValues,
  DefaultValues,
  Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { DynamicFormProps, FormField } from "../types/form";

function renderFieldControl(
  field: FormField,
  formField: any,
  loading: boolean,
) {
  switch (field.type) {
    case "select":
      return (
        <Select
          onValueChange={formField.onChange}
          defaultValue={formField.value}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={field.placeholder || `Select a ${field.label}`}
            />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "textarea":
      return (
        <Textarea
          placeholder={field.placeholder}
          {...formField}
          disabled={loading}
        />
      );
    default:
      return (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          {...formField}
          disabled={loading}
        />
      );
  }
}

export default function ShadcnDynamicForm<T extends FieldValues>({
  schema,
  fields,
  onSubmit,
  submitButtonText,
  formTitle,
  error,
  loading = false,
  linkText,
  linkHref,
}: DynamicFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema as any) as Resolver<T>,
    defaultValues: Object.fromEntries(
      fields.map((field) => {
        switch (field.type) {
          case "number":
            return [field.name, undefined];
          case "date":
            return [field.name, undefined];
          case "select":
          case "text":
          case "email":
          case "password":
          case "textarea":
          default:
            return [field.name, ""];
        }
      }),
    ) as DefaultValues<T>,
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          {formTitle}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field: FormField) => (
              <ShadcnFormField
                key={field.name}
                control={form.control}
                name={field.name as FieldPath<T>}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {renderFieldControl(field, formField, loading)}
                    </FormControl>
                    {field.description && (
                      <FormDescription>{field.description}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : submitButtonText}
            </Button>
          </form>
        </Form>
        {linkText && linkHref && (
          <p className="text-center text-sm text-gray-600">
            {linkText}{" "}
            <Link
              href={linkHref}
              className="font-medium text-blue-600 hover:underline"
            >
              {linkHref.includes("sign-up") ? "Sign up" : "Sign in"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
