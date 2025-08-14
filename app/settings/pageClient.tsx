"use client";
import Skeleton from "../components/Skeleton";
import ThemeSelector from "../components/ThemeSelector";

export default function SettingsPageClient() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <Skeleton height={40} className="mb-4" />
      <Skeleton height={80} />
    </div>
  );
}
