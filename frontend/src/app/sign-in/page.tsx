"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useUser } from "@/components/UserProvider";
import ShadcnDynamicForm from "@/components/ShadcnDynamicForm";
import { FormField } from "@/types/form";
import { useLoading } from "@/hooks/useLoading";
import AuthLayout from "@/components/AuthLayout";

const signinSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function SigninPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { refetchUser } = useUser();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const signinFields: FormField[] = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
    },
  ];

  const handleSignin = useCallback(
    async (values: z.infer<typeof signinSchema>) => {
      startLoading();
      setError("");

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      try {
        const res = await fetch(`${API_URL}/api/v1/auth/login/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (res.ok) {
          await refetchUser();
          router.replace("/");
        } else {
          const text = await res.text();
          console.error("Sign in fail, status:", res.status, "body:", text); // eslint-disable-line no-console
          setError("Invalid credentials");
        }
      } catch (err) {
        console.error("Network error during sign in:", err); // eslint-disable-line no-console
        setError("Network error. Please try again.");
      } finally {
        stopLoading();
      }
    },
    [setError, refetchUser, router, startLoading, stopLoading],
  );

  return (
    <AuthLayout>
      <ShadcnDynamicForm
        schema={signinSchema}
        fields={signinFields}
        onSubmit={handleSignin}
        submitButtonText="Sign In"
        formTitle="Welcome Back"
        error={error}
        loading={isLoading}
        linkText="Don't have an account yet?"
        linkHref="/sign-up"
        cardClass="w-full max-w-md p-8 space-y-6 bg-white rounded-lg"
      />
    </AuthLayout>
  );
}
