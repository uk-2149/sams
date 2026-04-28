"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDepartments = pathname.includes("/departments");
  const isFaculty = pathname.includes("/faculty");
  const isStudent = pathname.includes("/student");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Manage University</h1>
      </div>

      <Tabs value={isDepartments ? "departments" : isFaculty ? "faculty" : "students"} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-zinc-100">
          <TabsTrigger value="departments" asChild>
            <Link href="/admin/manage/departments">Departments</Link>
          </TabsTrigger>
          <TabsTrigger value="faculty" asChild>
            <Link href="/admin/manage/faculty">Faculty</Link>
          </TabsTrigger>
          <TabsTrigger value="students" asChild>
            <Link href="/admin/manage/student">Students</Link>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">{children}</div>
      </Tabs>
    </div>
  );
}