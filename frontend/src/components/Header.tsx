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
    <header className="bg-dark shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-center text-blue-900 mb-2">
            🌊 Marine Species Observation Tracker
          </h1>
          <p className="text-xl text-blue-700 mb-2">
            Empower divers, biologists, and hobbyists...
          </p>
          {loading && <p className="text-sm text-gray-600">Loading user...</p>}
          {!loading && user && (
            <p className="text-sm text-gray-600">Welcome, {user.username}</p>
          )}
          {!loading && !user && (
            <p className="text-sm text-red-600">Not logged in.</p>
          )}
        </div>
        <nav className="flex items-center space-x-4">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            type="button"
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
          <button
            onClick={handleAllObservations}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            type="button"
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
          {user && (
            <button
              onClick={logout} // Use the logout function from context
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              type="button"
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
