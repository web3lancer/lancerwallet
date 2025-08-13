import React from "react";

export default function Skeleton({ height = 24, width = "100%", className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`}
      style={{ height, width }}
    />
  );
}
