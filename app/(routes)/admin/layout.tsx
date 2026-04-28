import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { Toaster } from "sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("attendify-token")?.value;

  if (!token) redirect("/auth/login");

  const user = verifyToken(token);
  if (!user) redirect("/auth/login");
  if (user.role !== "UNIVERSITY_ADMIN") redirect("/unauthorized");

  return (
    <div className="h-screen bg-zinc-50 flex overflow-hidden">
      {/* Sidebar: fixed, non-scrollable, hidden on mobile */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}