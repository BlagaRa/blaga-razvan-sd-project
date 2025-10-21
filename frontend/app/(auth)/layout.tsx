"use client";

import "../globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function PublicOnlyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  // din store-ul simplificat pe care ți l-am dat
  const accessToken = useUserStore((s) => s.accessToken);
  const loadFromStorage = useUserStore((s) => s.loadFromStorage);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFromStorage().finally(() => setReady(true));
  }, [loadFromStorage]);

  useEffect(() => {
    if (!ready) return;
    if (accessToken) {
      router.replace("/profile"); // fără reload
    }
  }, [ready, accessToken, router]);

  if (!ready || accessToken) return null; // nu arăta nimic cât timp decidem / dacă redirecționăm

  return <main>{children}</main>;
}
