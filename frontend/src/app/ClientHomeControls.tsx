"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  username: string;
  email: string;
};

function getCookie(name: string) {
  if (typeof document === "undefined") {
    return null; // Document is not available on the server-side
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue;
  }
  return null;
}

export default function ClientHomeControls() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/profiles/me/`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          const text = await res.text();
          console.error("me fail, status:", res.status, "body:", text);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("me request failed", err);
        setLoading(false);
      });
  }, []);
  const handleLogout = async () => {
    const csrftoken = getCookie("csrftoken");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrftoken || "",
        "Content-Type": "application/json",
      },
    });
    // Redirect to login page after successful (or attempted) logout
    window.location.reload();
  };

  if (loading) return <div>Loading...</div>;
  if (user)
    return (
      <>
        <div className="mb-4">
          <b>Logged in as:</b> {user.username} ({user.email})
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Logout
        </button>
      </>
    );
  return <div className="mb-4 text-red-600">Not logged in.</div>;
}
