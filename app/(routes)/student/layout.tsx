import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Link from "next/link";
import { Toaster } from "sonner";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("attendify-token")?.value;

  if (!token) redirect("/auth/login");

  const user = verifyToken(token);
  if (!user) redirect("/auth/login");
  if (user.role !== "STUDENT") redirect("/unauthorized");

  return (
    <div className="h-screen bg-zinc-50 flex overflow-hidden">
      <div className="hidden md:block flex-shrink-0">
        <StudentSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-white px-4 md:px-6 flex items-center justify-between flex-shrink-0">
          <h1 className="font-semibold text-lg">Student Portal</h1>
          <LogoutButton />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieStore.set("attendify-token", "", { maxAge: 0, path: "/" });
        const { redirect } = await import("next/navigation");
        redirect("/auth/login");
      }}
    >
      <button
        type="submit"
        className="text-sm text-zinc-500 hover:text-red-600 transition-colors"
      >
        Logout
      </button>
    </form>
  );
}

function StudentSidebar() {
  return (
    <div className="w-56 bg-white border-r h-full flex flex-col">
      <div className="px-4 py-5 border-b flex-shrink-0">
        <Link href="/student/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <div className="font-semibold text-sm">Attendify</div>
            <div className="text-[9px] text-zinc-400">Student</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <Link href="/student/dashboard" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100">
          Dashboard
        </Link>
        <Link href="/student/attendance" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100">
          Attendance
        </Link>
      </nav>
    </div>
  );
}
