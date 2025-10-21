"use client";

import "../globals.css";
import Navbar from "@/components/layout/navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const accessToken = useUserStore((s) => s.accessToken);
  const loadFromStorage = useUserStore((s) => s.loadFromStorage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFromStorage().finally(() => setReady(true));
  }, [loadFromStorage]);

  useEffect(() => {
    if (!ready) return;
    if (!accessToken) router.replace("/login");
  }, [ready, accessToken, router]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-gray-500">
        Se încarcă sesiunea…
      </div>
    );
  }

  if (!accessToken) {
    // Vei fi redirecționat imediat; afișăm un fallback.
    return (
      <div className="min-h-screen grid place-items-center text-sm text-gray-500">
        Te redirecționăm către login…
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
}
