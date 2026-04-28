// components/admin/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { AuthUser } from "@/types";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    // Force full navigation to clear server-side cache
    window.location.href = "/auth/login";
  };

  const getTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/manage/departments")) return "Departments";
    if (pathname.includes("/manage/faculty")) return "Faculty";
    if (pathname.includes("/manage/student")) return "Students";
    if (pathname.includes("/classes")) return "Classes";
    return "Admin";
  };

  return (
    <>
      <header className="h-14 border-b bg-white px-4 md:px-8 flex items-center justify-between flex-shrink-0">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-zinc-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <h1 className="font-semibold text-lg md:text-xl tracking-tight">{getTitle()}</h1>

        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <span className="hidden sm:inline text-sm text-zinc-500 font-medium">
              {user.userId || "Admin"}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-500 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 md:mr-1.5" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}
    </>
  );
}