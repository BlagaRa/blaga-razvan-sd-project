"use client";

import { create } from "zustand";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toasts";

const API_URL = process.env.NEXT_PUBLIC_DEVICE_API_URL || "http://localhost:3002";
const DEVICE_URL = `${API_URL}/device`;


export type DeviceType = "LIGHT" | "SENSOR" | "NETWORK" | "SECURITY";
export type DeviceStatus = "ONLINE" | "OFLINE";
export type DeviceRoom = "LIVINGROOM" | "BEDROOM" | "BATHROOM" | "KITCHEN";

export interface Device {
  id: number;
  userId: number;
  name: string;
  maxConsumption: number;
  room: DeviceRoom;
  status: DeviceStatus;
  type: DeviceType;
  createdAt: string;
  updatedAt: string;
}

interface DeviceState {
  devices: Device[];
  allDevices:Device[];
  loading: boolean;
  error: string | null;
  getMyDevices: () => Promise<void>;
  getAllDevices:()=>Promise<void>;
  createDevice: (data: Omit<Device, "id" | "userId" | "createdAt" | "updatedAt" | "status">) => Promise<boolean>;
  updateDevice: (id: number, data: Partial<Device>) => Promise<boolean>;
  deleteDevice: (id: number) => Promise<boolean>;
  updateDeviceByIdAsAdmin:(id:number,data:Partial<Device>)=>Promise<boolean>;

}

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  allDevices:[],
  loading: false,
  error: null,

  getAllDevices:async()=>{
    try {
      const res=await api.get(`${DEVICE_URL}/admin`);
      set({allDevices:res.data.devices})
    } catch {
      toast({ title: "Error ❌", description: "Failed to fetch devices", variant: "destructive" });
      
    }
  },

  getMyDevices: async () => {
    try {
      const res = await api.get(`${DEVICE_URL}/my-devices`);
      set({ devices: res.data.devices });
    } catch {
      toast({ title: "Error ❌", description: "Failed to fetch devices", variant: "destructive" });
    }
  },

  createDevice: async (data) => {
    try {
      await api.post(`${DEVICE_URL}/create`, data);
      await get().getMyDevices();
      toast({ title: "Device created ✅" });
      return true;
    } catch {
      toast({ title: "Error ❌", description: "Failed to create device", variant: "destructive" });
      return false;
    }
  },

  updateDevice: async (id, data) => {
    try {
      await api.put(`${DEVICE_URL}/update-device/${id}`, data);
      await get().getMyDevices();
      toast({ title: "Device updated ✅" });
      return true;
    } catch {
      toast({ title: "Error ❌", description: "Failed to update device", variant: "destructive" });
      return false;
    }
  },

  deleteDevice: async (id) => {
    try {
      await api.delete(`${DEVICE_URL}/delete-device/${id}`);
      await get().getMyDevices();
      toast({ title: "Device deleted 🗑️" });
      return true;
    } catch {
      toast({ title: "Error ❌", description: "Failed to delete device", variant: "destructive" });
      return false;
    }
  },
  updateDeviceByIdAsAdmin: async (id, data) => {
  try {
    await api.put(`${DEVICE_URL}/admin/${id}`, data);
    await get().getAllDevices();
    toast({ title: "Device updated ✅" });
    return true;
  } catch (err) {
    console.error(err);
    toast({
      title: "Error ❌",
      description: "Failed to update device",
      variant: "destructive",
    });
    return false;
  }
},

}));
