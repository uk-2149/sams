"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Building2, Mail, User, Lock, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    userId: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // basic validations
    if (!form.name || !form.email || !form.userId || !form.password) {
      setError("Please fill all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.terms) {
      setError("Please accept terms and conditions");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          userId: form.userId,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // auto redirect after success
      router.push("/admin/dashboard");

    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 font-sans">
      {/* Navbar */}
      <nav className="border-b bg-white/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <div>
              <div className="font-semibold text-2xl tracking-tight">Attendify</div>
              <div className="text-[10px] text-zinc-500 -mt-1">University Attendance System</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] px-6 py-8">
        <div className="w-full max-w-lg">
          <Card className="border border-zinc-200 shadow-xl bg-white overflow-hidden">
            <CardHeader className="px-8 pt-8 pb-6 text-center border-b border-zinc-100">
              <div className="mx-auto mb-5 w-14 h-14 bg-blue-100 rounded-3xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tighter">
                Register your University
              </CardTitle>
              <CardDescription className="text-base text-zinc-600 mt-2">
                Your University ID + Password will be used to login.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                
                {/* Name */}
                <div className="space-y-2">
                  <Label>University Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Odisha University of Technology and Research"
                    className="h-12"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Official Email Address</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="registrar@university.edu.in"
                    className="h-12"
                  />
                </div>

                {/* User ID (FIXED: removed .attendify.in) */}
                <div className="space-y-2">
                  <Label>University ID</Label>
                  <Input
                    value={form.userId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        userId: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder="youruniversity"
                    className="h-12"
                  />
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={form.terms}
                    onCheckedChange={(val) =>
                      setForm({ ...form, terms: !!val })
                    }
                  />
                  <span className="text-sm text-zinc-600">
                    I agree to Terms & Privacy Policy
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold bg-zinc-900 hover:bg-black rounded-2xl"
                >
                  {loading ? "Creating..." : "Create University Account"}
                </Button>
              </form>

              <p className="text-center text-zinc-600 mt-6">
                Already registered?{" "}
                <Link href="/auth/login" className="text-blue-600 font-semibold">
                  Login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}