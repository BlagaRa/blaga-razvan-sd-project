"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAdmin } = useUserStore();

  const links = [
    { name: "Devices", href: "/devices" },
    { name: "Profile", href: "/profile" },
    // adaugă Admin Dashboard doar dacă isAdmin
    ...(isAdmin ? [{ name: "Admin Dashboard", href: "/admin-dashboard" }] : []),
  ];

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Titlu */}
      <div className="px-6 py-4 text-lg font-bold border-b border-sidebar-border">
        SD Project
      </div>

      {/* Navigare */}
      <nav className="flex flex-col flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Buton de logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Footer */}
      <footer className="p-4 text-sm text-muted-foreground border-t border-sidebar-border">
        © 2025 SD Project
      </footer>
    </aside>
  );
}
