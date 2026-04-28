import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-zinc-200">403</div>
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-zinc-500 max-w-sm">
          You don't have permission to access this page. Please login with the correct role.
        </p>
        <Link
          href="/auth/login"
          className="inline-block mt-4 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-black transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
