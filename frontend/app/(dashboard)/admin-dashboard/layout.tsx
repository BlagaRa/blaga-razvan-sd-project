"use client";

import "../../globals.css";
import Navbar from "@/components/layout/navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  // din store-ul tău
  const accessToken = useUserStore((s) => s.accessToken);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const loadFromStorage = useUserStore((s) => s.loadFromStorage); 

  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFromStorage().finally(() => setReady(true));
  }, [loadFromStorage]);

  useEffect(() => {
    if (!ready) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/profile"); 
    }
  }, [ready, accessToken, isAdmin, router]);

  // Nu randăm până nu știm statusul sau dacă urmează redirect
  if (!ready || !accessToken || !isAdmin) return null;

  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
