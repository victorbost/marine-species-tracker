"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import AuthLayout from "@/components/AuthLayout";
import ShadcnDynamicForm from "@/components/ShadcnDynamicForm";
import { FormField } from "@/types/form";
import { useLoading } from "@/hooks/useLoading";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { startLoading, stopLoading, isLoading } = useLoading();

  const forgotPasswordFields: FormField[] = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email address",
    },
  ];

  const handleForgotPassword = useCallback(
    async (values: z.infer<typeof forgotPasswordSchema>) => {
      startLoading();
      setError("");
      setSuccess(false);

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      try {
        const res = await fetch(`${API_URL}/api/v1/auth/password-reset/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (res.ok) {
          setSuccess(true);
        } else {
          const errorData = await res.json();
          // eslint-disable-next-line no-console
          console.error(
            "Password reset failed, status:",
            res.status,
            "body:",
            errorData,
          );
          setError(
            errorData.detail ||
              errorData.email?.[0] ||
              "Failed to send password reset email. Please try again.",
          );
        }
      } catch (err) {
        console.error("Network error during password reset:", err); // eslint-disable-line no-console
        setError("Network error. Please try again.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Check Your Email
          </h2>
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              We&apos;ve sent you an email with instructions to reset your
              password.
            </p>
            <p className="text-center text-sm text-gray-500">
              If you don&apos;t see the email in your inbox, please check your
              spam folder.
            </p>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setError("");
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              Try a different email address
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <ShadcnDynamicForm
        schema={forgotPasswordSchema}
        fields={forgotPasswordFields}
        onSubmit={handleForgotPassword}
        submitButtonText="Send Reset Email"
        formTitle="Reset Your Password"
        error={error}
        loading={isLoading}
        linkText="Remember your password?"
        linkHref="/sign-in"
        cardClass="w-full max-w-md p-8 space-y-6 bg-white rounded-lg"
      />
    </AuthLayout>
  );
}
