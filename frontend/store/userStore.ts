"use client";

import { create } from "zustand";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toasts";

/** ========= Config ========= */
const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001";
const AUTH_URL = `${API_URL}/auth`;


/** ========= Types ========= */
interface DecodedToken {
  sub: number;
  email: string;
  username: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  exp: number;
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  isBanned: boolean;
  isEmailVerified: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  email: string | null;
  username: string | null;
  isAdmin: boolean;
  isEmailVerified: boolean;
  isBanned: boolean;
  auths: AuthUser[];
  loading: boolean;
  error: string | null;

  signup: (email: string, username: string, password: string) => Promise<boolean>;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;

  getAllAuth: () => Promise<void>;
  updateAuthById: (id: number, data: Partial<AuthUser>) => Promise<boolean>;
}

/** ========= Axios Instance ========= */
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** ========= JWT Helpers ========= */
function decodeJwt(token: string | null): DecodedToken | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/** ========= Store ========= */
export const useUserStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  email: null,
  username: null,
  isAdmin: false,
  isEmailVerified: false,
  isBanned: false,
  auths: [],
  loading: false,
  error: null,

  /** ========== SIGNUP ========== */
  signup: async (email, username, password) => {
    try {
      set({ loading: true });
      const res = await api.post(`${AUTH_URL}/signup`, { email, username, password,role:'USER' });

      set({loading:false})
      const {message}=res.data;

      toast({ title: message });
      return true;
    } catch (error) {
      const message =
        (error as AxiosError<{ message?: string }>).response?.data?.message ??
        "Signup failed.";
      set({ error: message, loading: false });
      toast({
        title: "Signup failed ❌",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  },

  /** ========== LOGIN ========== */
  login: async (identifier, password) => {
    try {
      console.log(AUTH_URL)
      set({ loading: true });
      const res = await api.post(`${AUTH_URL}/login`, { identifier, password });
      const { accessToken, refreshToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const payload = decodeJwt(accessToken);
      set({
        accessToken,
        refreshToken,
        userId: payload?.sub ?? null,
        email: payload?.email ?? null,
        username: payload?.username ?? null,
        isAdmin: payload?.isAdmin ?? false,
        isEmailVerified: payload?.isEmailVerified ?? false,
        loading: false,
      });

      toast({ title: "Welcome back 👋" });
      return true;
    } catch (error) {
      const message =
        (error as AxiosError<{ message?: string }>).response?.data?.message ??
        "Login failed.";
      set({ error: message, loading: false });
      toast({
        title: "Login failed ❌",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  },

  /** ========== LOGOUT ========== */
  logout: async() => {
    set({loading:true})
    await api.post(`${AUTH_URL}/logout`);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      username: null,
      isAdmin: false,
      isEmailVerified: false,
      isBanned: false,
      loading:false,
      auths: [],
    });
    toast({title:"Logout successfully"})
  },

  /** ========== LOAD FROM STORAGE ========== */
  loadFromStorage: async () => {
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");

    if (!token || isExpired(token)) {
      if (refresh) await get().refreshAccessToken();
      else get().logout();
      return;
    }

    const payload = decodeJwt(token);
    set({
      accessToken: token,
      refreshToken: refresh,
      userId: payload?.sub ?? null,
      email: payload?.email ?? null,
      username: payload?.username ?? null,
      isAdmin: payload?.isAdmin ?? false,
      isEmailVerified: payload?.isEmailVerified ?? false,
    });
  },

  /** ========== REFRESH TOKEN ========== */
  refreshAccessToken: async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return false;
    try {
      const res = await api.post(`${AUTH_URL}/refresh-token`, { refreshToken: refresh });
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const payload = decodeJwt(accessToken);
      set({
        accessToken,
        refreshToken,
        userId: payload?.sub ?? null,
        email: payload?.email ?? null,
        username: payload?.username ?? null,
        isAdmin: payload?.isAdmin ?? false,
        isEmailVerified: payload?.isEmailVerified ?? false,
      });

      return true;
    } catch {
      return false;
    }
  },

  /** ========== ADMIN: GET ALL USERS ========== */
  /** ========== ADMIN: GET ALL USERS ========== */
getAllAuth: async () => {
  try {
    const res = await api.get(`${AUTH_URL}/admin`);

    // transformăm datele primite din backend
    const users = res.data.map((u: any) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      isAdmin: u.role === "ADMIN",
      isBanned: u.isBanned,
      isEmailVerified: u.isEmailVerified,
    }));

    set({ auths: users });
  } catch (error) {
    const message =
      (error as AxiosError<{ message?: string }>).response?.data?.message ??
      "Failed to fetch users.";
    toast({
      title: "Error ❌",
      description: message,
      variant: "destructive",
    });
    set({ auths: [] });
  }
},


  /** ========== ADMIN: UPDATE USER ========== */
  
updateAuthById: async (id, data) => {
  try {
    // eliminăm câmpurile care sunt null sau neschimbate
    const payload: Partial<AuthUser> = {};

    if (data.email !== undefined && data.email !== null && data.email !== "")
      payload.email = data.email;
    if (data.username !== undefined && data.username !== null && data.username !== "")
      payload.username = data.username;
    if (data.isAdmin !== undefined)
      payload.isAdmin = data.isAdmin;
    if (data.isBanned !== undefined)
      payload.isBanned = data.isBanned;
    if (data.isEmailVerified !== undefined)
      payload.isEmailVerified = data.isEmailVerified;

    await api.put(`${AUTH_URL}/admin/${id}`, payload);
    toast({ title: "✅ User updated successfully" });
    await get().getAllAuth();
    return true;
  } catch (error) {
    const message =
      (error as AxiosError<{ message?: string }>).response?.data?.message ??
      "Failed to update user.";
    toast({
      title: "Error ❌",
      description: message,
      variant: "destructive",
    });
    return false;
  }
},

}));
