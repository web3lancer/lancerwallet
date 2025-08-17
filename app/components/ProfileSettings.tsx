"use client";

import React, { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { userAvatars } from "@/lib/appwrite/storage";
import { users } from "@/lib/appwrite/databases";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { appwriteAccount } from "@/lib/appwrite";

export default function ProfileSettings() {
  const { user, setUser } = useStore();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.prefs.avatar_id
      ? userAvatars.getView(user.prefs.avatar_id).href
      : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let avatarId = user.prefs.avatar_id;

      if (avatarFile) {
        if (avatarId) {
          await userAvatars.delete(avatarId);
        }
        const newAvatar = await userAvatars.create(avatarFile);
        avatarId = newAvatar.$id;
      }

      await users.update(user.$id, { displayName });
      const updatedAccount = await appwriteAccount.updatePrefs({
        ...user.prefs,
        avatar_id: avatarId,
      });

      setUser(updatedAccount);

      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-primary mb-4">
        Profile Settings
      </h3>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Avatar
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            ref={fileInputRef}
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Change Avatar
          </Button>
        </div>
        <div>
          <label
            htmlFor="displayName"
            className="text-sm font-medium text-secondary mb-2 block"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Card>
  );
}
