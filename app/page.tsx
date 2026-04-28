import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BookOpen, BarChart3, Shield, Clock, Award } from "lucide-react";
import Link from "next/link";

export default function AttendanceLanding() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-lg">
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

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="hidden md:block text-sm font-medium">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-zinc-900 hover:bg-black text-white font-semibold px-6">
              Get Started
            </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 bg-white mb-6">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Now in Beta</Badge>
            <span className="text-xs text-zinc-500">Built for Indian Universities</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-semibold tracking-tighter leading-none mb-6 text-balance">
            Smart Attendance.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Zero Hassle.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-zinc-600 leading-relaxed mb-10">
            Complete attendance management platform for universities. Register your institution, 
            manage faculties &amp; students, track real-time attendance, and get powerful insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-zinc-900 hover:bg-black text-white text-lg px-10 py-7 rounded-2xl font-semibold flex items-center gap-3 group"
            >
              Start Now
              <span className="group-hover:translate-x-1 transition">→</span>
            </Button>
            {/* <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-10 py-7 rounded-2xl border-zinc-300 hover:bg-zinc-100"
            >
              Watch 2-min Demo
            </Button> */}
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 flex justify-center">
            <div className="relative w-full max-w-[1100px]">
              <Image
                src="/dashboard-preview.png"
                alt="Attendify Dashboard Preview"
                width={1100}
                height={620}
                className="rounded-3xl shadow-2xl border border-zinc-200"
                priority
              />
              <div className="absolute -bottom-6 -right-6 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl max-w-[280px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">Today&apos;s Attendance</div>
                    <div className="text-3xl font-semibold text-emerald-600">94.8%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="uppercase tracking-[3px] text-blue-600 text-sm font-medium mb-3">POWERFUL FEATURES</div>
            <h2 className="text-5xl font-semibold tracking-tighter">Everything your university needs</h2>
            <p className="mt-4 text-zinc-600 text-lg max-w-2xl mx-auto">
              From onboarding to daily attendance and analytics — all in one clean platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <Card className="border border-zinc-200 hover:border-blue-200 transition-all group bg-white">
              <CardContent className="p-10">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Institution Onboarding</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Universities register in minutes. Create departments, faculties, and import students via CSV or Excel.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Bulk student import</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Role-based access control</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Faculty &amp; Department hierarchy</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 hover:border-indigo-200 transition-all group bg-white">
              <CardContent className="p-10">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Class &amp; Session Management</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Create courses, sections, and assign teachers. Teachers start live sessions and mark attendance instantly.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Real-time attendance marking</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> QR code / Biometric ready</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Auto session timing</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 hover:border-violet-200 transition-all group bg-white">
              <CardContent className="p-10">
                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                  <BarChart3 className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Advanced Analytics</h3>
                <p className="text-zinc-600 leading-relaxed">
                  University admins get powerful dashboards with attendance trends, defaulter lists, and exportable reports.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Comprehensive reports</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Low attendance alerts</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Department-wise insights</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 hover:border-rose-200 transition-all group bg-white">
              <CardContent className="p-10">
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                  <Shield className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Secure Access Control</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Admins control permissions. Faculty can only mark attendance by default. Modify rights granted explicitly.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Granular permissions</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Full audit logs</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Two-factor authentication</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 hover:border-amber-200 transition-all group bg-white">
              <CardContent className="p-10">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Student Portal</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Students can view their attendance percentage, subject-wise records, and download certificates.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Personal dashboard</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> 75% attendance warning</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Mobile friendly</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 hover:border-cyan-200 transition-all group bg-white">
              <CardContent className="p-10">
                <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                  <Award className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Faculty Experience</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Teachers get a clean, fast interface to start sessions, mark attendance, and view records.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> One-tap attendance</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Offline mode support</li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> Quick session notes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

            {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-zinc-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-blue-600 text-sm font-medium tracking-widest">3 SIMPLE STEPS</div>
            <h2 className="text-5xl font-semibold tracking-tighter mt-3">
              From registration to daily attendance in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-10 border border-zinc-200 relative group hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-center">University Registers</h3>
                <p className="text-zinc-600 text-center leading-relaxed">
                  Sign up as an institution admin. Add departments, faculties, and upload student data easily.
                </p>
                <div className="mt-12 flex justify-center">
                  <div className="text-[120px] opacity-70">🏛️</div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-10 border border-zinc-200 relative group hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-center">Setup Classes &amp; Teachers</h3>
                <p className="text-zinc-600 text-center leading-relaxed">
                  Create courses, assign students to classes, and link faculty members.
                </p>
                <div className="mt-12 flex justify-center">
                  <div className="text-[110px] opacity-70">📚</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-10 border border-zinc-200 relative group hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-center">Daily Attendance</h3>
                <p className="text-zinc-600 text-center leading-relaxed">
                  Teachers start session → Mark attendance instantly → Admins monitor in real-time.
                </p>
                <div className="mt-12 flex justify-center">
                  <div className="w-28 h-28 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-emerald-600 opacity-70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 bg-zinc-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-semibold tracking-tighter mb-6">
            Ready to modernize your university attendance?
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Join hundreds of institutions already using Attendify to save thousands of hours every semester.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-12 py-8 rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100 font-semibold"
          >
            Create Your University Account — It&apos;s Free
          </Button>
          <p className="text-xs text-zinc-500 mt-6">No credit card required • Setup in under 10 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <div className="font-semibold text-3xl tracking-tight">Attendify</div>
            </div>
            <p className="text-zinc-600 max-w-md">
              The most intuitive and powerful attendance management system built for Indian universities.
            </p>
            <div className="mt-8 text-xs text-zinc-500">© 2026 Attendify. Made with ❤️ for education in India.</div>
          </div>

          <div className="md:col-span-2">
            <div className="font-medium mb-6 text-zinc-900">Product</div>
            <div className="space-y-3 text-sm text-zinc-600">
              <div>Features</div>
              <div>Pricing</div>
              <div>Security</div>
              <div>Roadmap</div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-medium mb-6 text-zinc-900">Company</div>
            <div className="space-y-3 text-sm text-zinc-600">
              <div>About Us</div>
              <div>Careers</div>
              <div>Blog</div>
              <div>Contact</div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="font-medium mb-6 text-zinc-900">Get in touch</div>
            <div className="text-sm text-zinc-600">
              hello@attendify.in<br />
              +91 674 123 4567<br />
              Bhubaneswar, Odisha
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}