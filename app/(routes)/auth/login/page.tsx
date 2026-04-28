"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, UserCog, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [admin, setAdmin] = useState({ id: "", password: "" });
  const [faculty, setFaculty] = useState({ id: "", password: "" });
  const [student, setStudent] = useState({ id: "", password: "" });

  const handleLogin = async (
    role: "ADMIN" | "FACULTY" | "STUDENT",
    identifier: string,
    password: string
  ) => {
    if (!identifier || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // role-based redirect
      if (role === "ADMIN") router.push("/admin/dashboard");
      if (role === "FACULTY") router.push("/faculty/dashboard");
      if (role === "STUDENT") router.push("/student/dashboard");

    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-lg">
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

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <Card className="border border-zinc-200 shadow-2xl bg-white overflow-hidden">
            <CardHeader className="px-10 pt-10 pb-6 text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center">
                <Lock className="w-9 h-9 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tighter">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-zinc-600 mt-2">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="px-10 pb-10">
              <Tabs defaultValue="admin" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-zinc-100">
                  <TabsTrigger value="admin">
                    <Building2 className="w-4 h-4 mr-1" /> Admin
                  </TabsTrigger>
                  <TabsTrigger value="faculty">
                    <UserCog className="w-4 h-4 mr-1" /> Faculty
                  </TabsTrigger>
                  <TabsTrigger value="student">
                    <Users className="w-4 h-4 mr-1" /> Student
                  </TabsTrigger>
                </TabsList>

                {/* ADMIN */}
                <TabsContent value="admin">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin("ADMIN", admin.id, admin.password);
                    }}
                  >
                    <div className="space-y-2">
                      <Label>University User ID</Label>
                      <Input
                        placeholder="e.g. outr"
                        className="h-12"
                        value={admin.id}
                        onChange={(e) =>
                          setAdmin({ ...admin, id: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-12 pr-10"
                          value={admin.password}
                          onChange={(e) =>
                            setAdmin({ ...admin, password: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-lg font-semibold bg-zinc-900 hover:bg-black rounded-2xl"
                    >
                      {loading ? "Logging in..." : "Login as University Admin"}
                    </Button>
                  </form>
                </TabsContent>

                {/* FACULTY */}
                <TabsContent value="faculty">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin("FACULTY", faculty.id, faculty.password);
                    }}
                  >
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input
                        placeholder="e.g. FAC-202301"
                        className="h-12"
                        value={faculty.id}
                        onChange={(e) =>
                          setFaculty({ ...faculty, id: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-12 pr-10"
                          value={faculty.password}
                          onChange={(e) =>
                            setFaculty({ ...faculty, password: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-lg font-semibold bg-zinc-900 hover:bg-black rounded-2xl"
                    >
                      {loading ? "Logging in..." : "Login as Faculty"}
                    </Button>
                  </form>
                </TabsContent>

                {/* STUDENT */}
                <TabsContent value="student">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin("STUDENT", student.id, student.password);
                    }}
                  >
                    <div className="space-y-2">
                      <Label>Roll Number</Label>
                      <Input
                        placeholder="e.g. 22051001"
                        className="h-12"
                        value={student.id}
                        onChange={(e) =>
                          setStudent({ ...student, id: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-12 pr-10"
                          value={student.password}
                          onChange={(e) =>
                            setStudent({ ...student, password: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-lg font-semibold bg-zinc-900 hover:bg-black rounded-2xl"
                    >
                      {loading ? "Logging in..." : "Login as Student"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
              )}

              {/* Forgot Password */}
              <div className="text-center mt-6">
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-zinc-400 mt-8">
            Secure login • All sessions expire after 1 hour
          </p>
        </div>
      </div>
    </div>
  );
}