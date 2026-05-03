"use client";

import React, { useState, useTransition, ChangeEvent } from "react";
import { changeName, changeDesc, changeImage } from "@/actions/profileActions";
import { compressImage } from "@/lib/compressImage";
import { uploadImageToCloud } from "@/lib/uploadImage";

// User type definition (must match the incoming data)
interface User {
  _id: { toString(): string } | string;
  name: string;
  avatar?: string | null;
  sellerInfo?: {
    description?: string;
  } | null;
}

// Action function type definition
type ProfileAction = (value: string) => Promise<void>;

export default function ProfileEditor({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user.name);
  const [desc, setDesc] = useState(user.sellerInfo?.description ?? "");
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [isUploading, setIsUploading] = useState(false);

  const [editingField, setEditingField] = useState<string | null>(null);

  // ✅ Save function for any field (name or description)
  const handleSave = (action: ProfileAction, value: string) => {
    startTransition(async () => {
      await action(value);
      setEditingField(null);
    });
  };

  // ✅ Upload image function
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const imageUrl = await uploadImageToCloud(compressedFile);
      setAvatar(imageUrl);
      await changeImage(imageUrl);
    } catch (error) {
      alert("An error occurred while uploading the image");
    } finally {
      setIsUploading(false);
      setEditingField(null);
    }
  };

  return (
    <div className="space-y-4 border-t pt-6 mt-6">
      <h3 className="text-lg font-bold text-gray-800">Profile Settings</h3>

      {/* Edit Image */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            name.charAt(0)
          )}
        </div>

        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          {isUploading ? "Compressing and uploading..." : "Change Image 📷"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Edit Name */}
      <div className="p-3 bg-gray-50 rounded-xl">
        {editingField === "name" ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your new name"
              className="flex-1 border border-gray-300 p-2 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-400"
            />
            <button
              onClick={() => handleSave(changeName, name)}
              disabled={isPending}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="font-medium">{name}</p>
            <button onClick={() => setEditingField("name")} className="text-blue-600 text-sm font-semibold">
              Edit Name ✏️
            </button>
          </div>
        )}
      </div>

      {/* Edit Description */}
      <div className="p-3 bg-gray-50 rounded-xl">
        {editingField === "desc" ? (
          <div className="flex gap-2">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Write a brief description of yourself or your store..."
              className="flex-1 border border-gray-300 p-2 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-400"
              rows={2}
            />
            <button
              onClick={() => handleSave(changeDesc, desc)}
              disabled={isPending}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm h-fit"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">{desc || "No description yet..."}</p>
            <button onClick={() => setEditingField("desc")} className="text-blue-600 text-sm font-semibold">
              Edit Description 📝
            </button>
          </div>
        )}
      </div>
    </div>
  );
}