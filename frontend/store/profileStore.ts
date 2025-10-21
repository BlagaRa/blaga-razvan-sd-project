"use client";

import { create } from "zustand";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toasts";

const API_URL = process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:3003";
const PROFILE_URL = `${API_URL}/profile`;


export interface Profile {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  description?: string;
  avatarImage?: string;
}

interface ProfileState {
  profile: Profile | null;
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  createProfile: (data: Partial<Profile>) => Promise<boolean>;
  getMyProfile: () => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
  getAllProfiles: () => Promise<void>;
  getProfileById: (id: number) => Promise<Profile | null>;
}

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  profiles: [],
  loading: false,
  error: null,

  createProfile: async (data) => {
    try {
      const res = await api.post(`${PROFILE_URL}/create`, data);
      console.log(localStorage.getItem("accessToken"))
      set({ profile: res.data });
      toast({ title: "Profile created ✅" });
      return true;
    } catch (error) {
      const msg = (error as AxiosError<{ message?: string }>).response?.data?.message ?? "Failed to create profile.";
      toast({ title: "Error ❌", description: msg, variant: "destructive" });
      return false;
    }
  },

  getMyProfile: async () => {
  try {
    const res = await api.get(`${PROFILE_URL}/me`);
    set({ profile: res.data });
    return true;
  } catch (err) {
    const status = (err as AxiosError).response?.status;

    if (status === 404) {
      // NU există profil încă -> setează null și lasă UI-ul să arate formularul Create
      set({ profile: null });
      return false;
    }

    if (status === 401) {
      // token lipsă/expirat
      set({ profile: null });
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      return false;
    }

    toast({ title: "Error ❌", description: "Failed to load profile", variant: "destructive" });
    return false;
  }
},



  updateProfile: async (data) => {
    try {
      await api.put(`${PROFILE_URL}/update`, data);
      toast({ title: "Profile updated ✅" });
      return true;
    } catch {
      toast({ title: "Update failed ❌", description: "Profile update error", variant: "destructive" });
      return false;
    }
  },

  getAllProfiles: async () => {
    try {
      const res = await api.get(`${PROFILE_URL}/admin`);
      set({ profiles: res.data });
    } catch {
      toast({ title: "Error ❌", description: "Failed to fetch profiles", variant: "destructive" });
    }
  },

  getProfileById: async (id) => {
    try {
      const res = await api.get(`${PROFILE_URL}/admin/${id}`);
      return res.data;
    } catch {
      toast({ title: "Error ❌", description: "Profile not found", variant: "destructive" });
      return null;
    }
  },
}));
