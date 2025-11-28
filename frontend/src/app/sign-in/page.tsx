"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod"; // Import zod
import { useUser } from "../../components/UserProvider";
import ShadcnDynamicForm from "../../components/ShadcnDynamicForm"; // Updated import path
import { FormField } from "../../types/form"; // Import FormField type

const signinSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Minimum 1 for basic presence
});

export default function SigninPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refetchUser } = useUser();

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

  async function handleSignin(values: z.infer<typeof signinSchema>) {
    setLoading(true);
    setError("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values), // Send validated values
      });

      if (res.ok) {
        await refetchUser();
        router.replace("/");
      } else {
        const text = await res.text();
        console.error("Sign in fail, status:", res.status, "body:", text);
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Network error during sign in:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShadcnDynamicForm
      schema={signinSchema}
      fields={signinFields}
      onSubmit={handleSignin}
      submitButtonText="Sign In"
      formTitle="Welcome Back"
      error={error}
      loading={loading}
      linkText="Don't have an account yet?"
      linkHref="/sign-up"
    />
  );
}
