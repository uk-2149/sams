// components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { label: "Classes", href: "/admin/classes", icon: LayoutGrid },
];

const manageNav = [
  { label: "Departments", href: "/admin/manage/departments", icon: Building2 },
  { label: "Faculty", href: "/admin/manage/faculty", icon: Users },
  { label: "Students", href: "/admin/manage/student", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="w-64 bg-white border-r border-zinc-200 h-full flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <div className="font-semibold text-lg tracking-tight leading-tight">Attendify</div>
            <div className="text-[10px] text-zinc-400 leading-tight">Admin Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive(item.href)
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-zinc-100 text-zinc-600"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        <div className="pt-6 px-3">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Manage
          </p>
        </div>
        {manageNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive(item.href)
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-zinc-100 text-zinc-600"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="text-xs text-zinc-400">University Admin</div>
      </div>
    </div>
  );
}