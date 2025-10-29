"use client";
import { useState, useEffect } from "react";

type User = {
  username: string;
  email: string;
  // add more fields if needed
};
export default function ClientHomeControls() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(process.env.API_URL + "/api/v1/auth/profiles/me/", {
      credentials: "include",
    })
      .then(async (res) => {
        console.log("me response:", res.status);
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
    await fetch(process.env.API_URL + "/api/v1/auth/logout/", {
      method: "POST",
      credentials: "include",
    });
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
