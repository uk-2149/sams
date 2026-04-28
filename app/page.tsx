import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Users, 
  BookOpen, 
  BarChart3, 
  Shield, 
  Clock, 
  Award,
  GraduationCap,
  Calendar,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function AttendanceLanding() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-white font-bold text-3xl tracking-tighter">A</span>
            </div>
            <div>
              <div className="font-semibold text-3xl tracking-tighter">Attendify</div>
              <div className="text-[10px] text-zinc-500 -mt-1 font-medium">UNIVERSITY ATTENDANCE SYSTEM</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it Works</a>
            <a href="#benefits" className="hover:text-zinc-900 transition-colors">For Universities</a>
            <a href="#contact" className="hover:text-zinc-900 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-zinc-900 hover:bg-black text-white font-semibold px-8 rounded-xl">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 via-white to-zinc-50 text-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#4f46e510_0%,transparent_50%)]" />
        
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-100 bg-white shadow-sm mb-8">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 shadow-none">
              Now in Beta
            </Badge>
            <span className="text-sm text-zinc-600 font-medium">Built for Indian Higher Education</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-semibold tracking-tighter leading-none mb-6 text-zinc-900">
            Attendance that respects<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              academic integrity
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-zinc-600 leading-relaxed mb-12">
            Modern, secure, and effortless attendance management for universities and colleges across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-10 py-7 rounded-2xl font-semibold flex items-center gap-3 shadow-xl shadow-blue-600/20"
            >
              Register Your Institution
              <span>→</span>
            </Button>
            {/* <Button 
              size="lg" 
              variant="outline" 
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-lg px-10 py-7 rounded-2xl bg-white"
            >
              Watch 90-second Demo
            </Button> */}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" /> Trusted by 20+ Institutions
            </div>
            <div>Odisha • Maharashtra • Karnataka • Tamil Nadu</div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> ISO 27001 Compliant
            </div>
          </div>
        </div>

        <div className="mt-20 max-w-5xl mx-auto px-6">
          {/* <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl bg-white p-2 md:p-4 aspect-video flex items-center justify-center">
            <Image
              src="/hero-illustration.png"
              alt="University Dashboard Illustration"
              width={1200}
              height={800}
              className="rounded-2xl w-full h-full object-cover"
              priority
            />
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="uppercase text-blue-600 text-sm tracking-[4px] font-medium">DESIGNED FOR ACADEMIA</div>
            <h2 className="text-5xl font-semibold tracking-tighter mt-4">
              Powerful tools for every stakeholder
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                color: "blue",
                title: "Institution Management",
                desc: "Seamless onboarding with department hierarchy, faculty roles, and bulk student import.",
                points: ["CSV/Excel Import", "Role-based Access", "Academic Year Setup"]
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                color: "indigo",
                title: "Smart Class Management",
                desc: "Create timetables, manage sections, and conduct live attendance with multiple methods.",
                points: ["QR + Biometric Ready", "Real-time Marking", "Session Auto-ending"]
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                color: "violet",
                title: "Analytics & Insights",
                desc: "Deep attendance analytics, defaulter tracking, and exportable reports for NAAC/NBA.",
                points: ["Department-wise Trends", "Low Attendance Alerts", "Compliance Reports"]
              },
              {
                icon: <Shield className="w-8 h-8" />,
                color: "rose",
                title: "Enterprise Security",
                desc: "Bank-grade security with complete audit trails and granular permission system.",
                points: ["2FA & SSO Ready", "Full Audit Logs", "Data Privacy Compliant"]
              },
              {
                icon: <GraduationCap className="w-8 h-8" />,
                color: "amber",
                title: "Student Experience",
                desc: "Clean student portal to track attendance, view records, and receive notifications.",
                points: ["75% Warning System", "Mobile Responsive", "Certificate Download"]
              },
              {
                icon: <Award className="w-8 h-8" />,
                color: "teal",
                title: "Faculty First Design",
                desc: "Minimal friction interface designed for teachers who value their time.",
                points: ["One-tap Attendance", "Offline Support", "Quick Notes"]
              }
            ].map((feature, i) => (
              <Card key={i} className="border border-zinc-200 hover:border-zinc-300 transition-all duration-300 group hover:shadow-xl">
                <CardContent className="p-10">
                  <div className={`w-16 h-16 bg-${feature.color}-100 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    <div className={`text-${feature.color}-600`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-zinc-600 leading-relaxed mb-8">{feature.desc}</p>
                  
                  <ul className="space-y-3">
                    {feature.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-28 px-6 bg-zinc-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-indigo-600 font-medium tracking-widest text-sm">3-STEP IMPLEMENTATION</div>
            <h2 className="text-5xl font-semibold tracking-tighter mt-3">From zero to live attendance in minutes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Institution Onboarding", desc: "Register and set up your university structure in under 10 minutes.", emoji: "🏛️" },
              { num: "2", title: "Academic Setup", desc: "Add programs, courses, sections, and assign faculty members.", emoji: "📖" },
              { num: "3", title: "Daily Operations", desc: "Teachers mark attendance effortlessly. Admins get real-time insights.", emoji: "✅" }
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-3xl p-10 border border-zinc-200 hover:shadow-2xl transition-all group relative">
                <div className="absolute -top-6 left-10 w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
                  {step.num}
                </div>
                <div className="pt-8 text-center">
                  <div className="text-7xl mb-6 opacity-75">{step.emoji}</div>
                  <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 bg-gradient-to-b from-zinc-50 to-blue-50 text-zinc-900 border-t border-zinc-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-semibold tracking-tighter mb-6">
            Modernize your attendance process today
          </h2>
          <p className="text-2xl text-zinc-600 mb-10">
            Join leading Indian universities saving hundreds of administrative hours every semester.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-14 py-8 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-2xl shadow-blue-600/20"
          >
            Create University Account
          </Button>
          <p className="mt-6 text-sm text-zinc-500">No credit card needed • Takes less than 10 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-3xl">A</span>
              </div>
              <div className="font-semibold text-3xl tracking-tighter">Attendify</div>
            </div>
            <p className="text-zinc-600 max-w-md">
              Simplifying attendance management for Indian universities with modern technology and academic-first design.
            </p>
            <div className="mt-10 text-xs text-zinc-500">
              © 2026 Attendify • Bhubaneswar, Odisha
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-semibold mb-6">Product</div>
            <div className="space-y-3 text-sm text-zinc-600">
              <div>Features</div>
              <div>Pricing</div>
              <div>Integrations</div>
              <div>Security</div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-semibold mb-6">Resources</div>
            <div className="space-y-3 text-sm text-zinc-600">
              <div>Documentation</div>
              <div>Help Center</div>
              <div>Blog</div>
              <div>NAAC Compliance</div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="font-semibold mb-6">Get in touch</div>
            <div className="text-zinc-600 text-sm leading-relaxed">
              hello@attendify.in<br />
              +91 674 456 7890<br />
              Bhubaneswar, Odisha, India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}