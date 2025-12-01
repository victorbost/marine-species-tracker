// frontend/src/components/GlobalLoader.tsx
"use client"; // Mark this component as a Client Component

import React from 'react';
import { useLoading } from '../hooks/useLoading';
import Loader from './Loader';

const GlobalLoader: React.FC = () => {
  const { isLoading } = useLoading();
  return <Loader isLoading={isLoading} />;
};

export default GlobalLoader;
