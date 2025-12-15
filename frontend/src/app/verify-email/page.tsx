"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import AuthLayout from "@/components/AuthLayout";
import ShadcnDynamicForm from "@/components/ShadcnDynamicForm";
import { FormField } from "@/types/form";
import { useLoading } from "@/hooks/useLoading";

const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: "Verification token is required." }),
});

function VerifyEmailContent() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenFromUrl, setTokenFromUrl] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const verifyEmailFields: FormField[] = [
    {
      name: "token",
      label: "Verification Code",
      type: "text",
      placeholder: "Enter your verification code",
      description: "Check your email for the verification code",
    },
  ];

  const handleVerifyEmail = useCallback(
    async (values: z.infer<typeof verifyEmailSchema>) => {
      startLoading();
      setError("");
      setSuccess(false);

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      try {
        const res = await fetch(`${API_URL}/api/v1/auth/verify-email/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (res.ok) {
          setSuccess(true);
          // Redirect to sign-in after a short delay
          setTimeout(() => {
            router.replace("/sign-in");
          }, 3000);
        } else {
          const errorData = await res.json();
          // eslint-disable-next-line no-console
          console.error(
            "Email verification failed, status:",
            res.status,
            "body:",
            errorData,
          );
          setError(
            errorData.detail ||
              errorData.token?.[0] ||
              "Email verification failed. Please try again.",
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Network error during email verification:", err);
        setError("Network error. Please try again.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, router],
  );

  // Get token from URL parameters
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setTokenFromUrl(token);
      // Auto-submit if token is present
      handleVerifyEmail({ token });
    }
  }, [searchParams, handleVerifyEmail]);

  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Email Verified Successfully!
          </h2>
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Your email has been verified. You can now sign in to your account.
            </p>
            <p className="text-center text-sm text-gray-500">
              You will be redirected to the sign-in page shortly.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <ShadcnDynamicForm
        schema={verifyEmailSchema}
        fields={verifyEmailFields}
        onSubmit={handleVerifyEmail}
        submitButtonText="Verify Email"
        formTitle="Verify Your Email"
        error={error}
        loading={isLoading}
        defaultValues={tokenFromUrl ? { token: tokenFromUrl } : undefined}
        linkText="Already have an account?"
        linkHref="/sign-in"
        cardClass="w-full max-w-md p-8 space-y-6 bg-white rounded-lg"
      />
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        </AuthLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
