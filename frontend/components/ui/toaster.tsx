"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: { background: "var(--background)", color: "var(--foreground)" },
      }}
    />
  )
}
