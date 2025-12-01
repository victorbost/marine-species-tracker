// frontend/src/components/GlobalLoader.tsx

"use client";

import React from "react";
import { useLoading } from "../hooks/useLoading";
import Loader from "./Loader";

function GlobalLoader() {
  const { isLoading } = useLoading();
  return <Loader isLoading={isLoading} />;
}

export default GlobalLoader;
