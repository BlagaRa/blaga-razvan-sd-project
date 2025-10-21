"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function Login() {
  const router = useRouter();
  const { login, loading } = useUserStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      const success=await login(identifier, password);

      if(success){
        setTimeout(() => {
          router.push("/devices");
        }, 1200);
      }
      
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <form
        onSubmit={handleSubmit}
        className="bg-card text-card-foreground p-8 rounded-lg shadow-md border border-border w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-primary text-center">
          Login
        </h1>

        <input
          type="text"
          placeholder="email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full mb-3 p-2 rounded-md border border-input bg-muted/30 text-foreground placeholder-muted-foreground"
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded-md border border-input bg-muted/30 text-foreground placeholder-muted-foreground"
          required
        />

        <p className="text-primary mb-3 p-2 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline hover:shadow-md">
            Sign up
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition cursor-pointer disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
