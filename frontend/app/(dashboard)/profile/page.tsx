"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/store/profileStore";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { username, email, isAdmin, isEmailVerified } = useUserStore();
  const { profile, getMyProfile, updateProfile, createProfile } =
    useProfileStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    description: "",
    avatarImage: "",
  });
  const [isChanged, setIsChanged] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");

  /** === Load profile data === */
  useEffect(() => {
    const load = async () => {
      const ok = await getMyProfile();
      if (!ok) setShowCreateDialog(true);
    };
    load();
  }, [getMyProfile]);

  /** === Update local formData when profile changes === */
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        description: profile.description ?? "",
        avatarImage: profile.avatarImage ?? "",
      });
    }
  }, [profile]);

  /** === Detect changes === */
  useEffect(() => {
    if (!profile) return;
    const changed =
      formData.firstName !== (profile.firstName ?? "") ||
      formData.lastName !== (profile.lastName ?? "") ||
      formData.description !== (profile.description ?? "") ||
      formData.avatarImage !== (profile.avatarImage ?? "");
    setIsChanged(changed);
  }, [formData, profile]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** === Save / Create === */
  const handleSave = async () => {
    const ok = await updateProfile(formData);
    if (ok) setIsChanged(false);
  };

  const handleCreateProfile = async () => {
    const ok = await createProfile(formData);
    if (ok) {
      setShowCreateDialog(false);
      await getMyProfile();
    }
  };

  /** === Handle Avatar Update === */
  const handleAvatarUpdate = async () => {
    if (!newAvatarUrl.startsWith("http")) {
      alert("Invalid image URL!");
      return;
    }
    await updateProfile({ avatarImage: newAvatarUrl });
    await getMyProfile();
    setShowAvatarDialog(false);
    setNewAvatarUrl("");
  };

  return (
    <div className="p-8 ml-80 min-h-screen bg-gray-50">
      {/* ===== PROFILE HEADER ===== */}
      <div className="bg-white shadow-md rounded-2xl p-6 flex flex-row items-center gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative group cursor-pointer"
          onClick={() => setShowAvatarDialog(true)}
        >
          <img
            className="rounded-2xl shadow-md border border-gray-200 w-24 h-24 object-cover cursor-pointer"
            src={
              formData.avatarImage ||
              "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg"
            }
            alt="profile"
          />
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
             Change Image
          </div>
        </motion.div>

        <div className="flex flex-col text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">{username}</h2>
          <p className="text-sm text-gray-500">{email}</p>

          {isEmailVerified ? (
            <p className="mt-1 text-xs bg-green-100 text-green-700 w-fit px-2 py-1 rounded-md">
              ✅ Email Verified
            </p>
          ) : (
            <p className="mt-1 text-xs bg-red-100 text-red-700 w-fit px-2 py-1 rounded-md">
              ❌ Email Not Verified
            </p>
          )}
        </div>

        {isChanged && (
          <Button
            onClick={handleSave}
            className="ml-auto bg-primary text-primary-foreground rounded-xl cursor-pointer"
          >
            Save Changes
          </Button>
        )}
      </div>

      {/* ===== PROFILE DETAILS FORM ===== */}
      {profile && (
        <div className="mt-8 bg-white shadow-md rounded-2xl p-8 max-w-3xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Profile Details
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Bio / Description
              </label>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Admin Account</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isEmailVerified ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <p className="text-sm text-gray-700">
                {isEmailVerified ? "Email Verified" : "Email Not Verified"}
              </p>
            </div>
          </div>
        </div>
      )}
      {!profile && (
  <div className="mt-8 bg-white shadow-md rounded-2xl p-8 max-w-3xl">
    <h3 className="text-lg font-semibold text-gray-800 mb-6">
      Create Your Profile
    </h3>

    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">First Name</label>
        <Input
          value={formData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Last Name</label>
        <Input
          value={formData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
        />
      </div>

      <div className="col-span-2 flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Bio / Description</label>
        <Textarea
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
    </div>

    <div className="mt-6">
      <Button onClick={handleCreateProfile}>Create Profile</Button>
    </div>
  </div>
)}

      {/* ===== AVATAR CHANGE DIALOG ===== */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Profile Picture 🖼️</DialogTitle>
            <DialogDescription>
              Paste the link (URL) of the image you want to use.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 mt-4">
            <Input
              placeholder="https://example.com/avatar.jpg"
              value={newAvatarUrl}
              onChange={(e) => setNewAvatarUrl(e.target.value)}
            />
            {newAvatarUrl && (
              <motion.img
                src={newAvatarUrl}
                alt="Preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-28 h-28 rounded-2xl object-cover shadow-md border"
              />
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowAvatarDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAvatarUpdate}>Save Avatar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
