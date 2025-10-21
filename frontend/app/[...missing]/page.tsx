// app/[...missing]/page.tsx
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic"; // util dacă site-ul e build-uit static
export default function CatchAll() {
  redirect("/profile");
}
