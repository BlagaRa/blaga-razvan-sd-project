"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function Signup() {
  const router = useRouter();
  const { signup, loading } = useUserStore();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup(email, username, password);
    if (success) {
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <form
        onSubmit={handleSubmit}
        className="bg-card text-card-foreground p-8 rounded-lg shadow-md border border-border w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-primary text-center">
          Sign Up
        </h1>

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 rounded-md border border-input bg-muted/30 text-foreground placeholder-muted-foreground"
          required
        />
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          Already have an account?{" "}
          <Link href="/login" className="underline hover:shadow-md">
            Login
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition cursor-pointer disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
