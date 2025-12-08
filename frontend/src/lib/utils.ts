// frontend/src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDepth(
  depthMin: number | null,
  depthMax: number | null,
): string | null {
  if (depthMin === null && depthMax === null) {
    return null;
  }
  if (depthMin !== null && depthMax !== null && depthMin === depthMax) {
    return `${depthMin}m`;
  }
  if (depthMin !== null && depthMax !== null) {
    return `${depthMin}m - ${depthMax}m`;
  }
  if (depthMin !== null) {
    return `${depthMin}m`;
  }
  if (depthMax !== null) {
    return `${depthMax}m`;
  }
  return null;
}
