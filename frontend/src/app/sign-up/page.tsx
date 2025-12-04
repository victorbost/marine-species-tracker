"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import AuthLayout from "@/components/AuthLayout";
import ShadcnDynamicForm from "@/components/ShadcnDynamicForm";
import { FormField } from "@/types/form";

const signupSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["hobbyist", "researcher"], {
    message: "Please select a valid role.",
  }),
});

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signupFields: FormField[] = [
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "Enter your username",
    },
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
    {
      name: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "hobbyist", label: "Hobbyist" },
        { value: "researcher", label: "Researcher" },
      ],
    },
  ];

  const handleSignup = useCallback(
    async (values: z.infer<typeof signupSchema>) => {
      setLoading(true);
      setError("");

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      try {
        const res = await fetch(`${API_URL}/api/v1/auth/register/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (res.ok) {
          router.replace("/sign-in");
        } else {
          const errorData = await res.json();
          // eslint-disable-next-line no-console
          console.error(
            "Sign up failed, status:",
            res.status,
            "body:",
            errorData,
          );
          setError(
            errorData.detail ||
              errorData.email?.[0] ||
              errorData.username?.[0] ||
              errorData.password?.[0] ||
              "Sign up failed. Please try again.",
          );
        }
      } catch (err) {
        console.error("Network error during sign up:", err); // eslint-disable-line no-console
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, router],
  );

  return (
    <AuthLayout>
      <ShadcnDynamicForm
        schema={signupSchema}
        fields={signupFields}
        onSubmit={handleSignup}
        submitButtonText="Sign Up"
        formTitle="Create Your Account"
        error={error}
        loading={loading}
        linkText="Already have an account?"
        linkHref="/sign-in"
      />
    </AuthLayout>
  );
}
