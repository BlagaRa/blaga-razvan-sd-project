"use client"

import { toast as sonner } from "sonner"

export const toast = (options: {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}) => {
  const { title, description, variant } = options

  if (variant === "destructive") {
    sonner.error(title || "Error", {
      description,
      duration: 4000,
    })
  } else {
    sonner.success(title || "Success", {
      description,
      duration: 3000,
    })
  }
}
