"use client";

import { useUser } from "./UserProvider";

export default function Header() {
  const { user, loading, logout } = useUser();

  const handleExport = () => {
    // eslint-disable-next-line no-alert
    alert("Export functionality will be implemented later.");
  };

  const handleAllObservations = () => {
    // eslint-disable-next-line no-alert
    alert("All Observations functionality will be implemented later.");
  };

  return (
    <header className="w-full bg-ocean-900/90 backdrop-blur-md border-b border-ocean-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* LEFT SECTION */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-display font-semibold text-ocean-100 tracking-tight">
            🌊 Marine Species Observation Tracker
          </h1>

          <p className="text-lg font-body text-ocean-300 mt-1">
            Empower divers, biologists, and hobbyists...
          </p>

          {loading && (
            <p className="text-sm text-ocean-400 mt-2">Loading user...</p>
          )}

          {!loading && user && (
            <p className="text-sm text-ocean-300 mt-2">
              Welcome, {user.username}
            </p>
          )}

          {!loading && !user && (
            <p className="text-sm text-red-400 mt-2">Not logged in.</p>
          )}
        </div>

        {/* RIGHT BUTTON GROUP */}
        <nav className="flex items-center space-x-3">
          {/* EXPORT BUTTON */}
          <button
            onClick={handleExport}
            type="button"
            className="flex items-center px-4 py-2 bg-ocean-600 text-ocean-50 rounded-xl
                       hover:bg-ocean-500 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>

          {/* ALL OBSERVATIONS */}
          <button
            onClick={handleAllObservations}
            type="button"
            className="flex items-center px-4 py-2 bg-ocean-800 text-ocean-200 rounded-xl
                       hover:bg-ocean-700 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            All Observations
          </button>

          {/* SIGN OUT */}
          {user && (
            <button
              onClick={logout}
              type="button"
              className="flex items-center px-4 py-2 bg-gray-200/20 text-ocean-200 rounded-xl
                         hover:bg-gray-300/20 transition-colors shadow-sm border border-gray-400/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
