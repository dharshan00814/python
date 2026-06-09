import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import AnimatedBackground from "../components/AnimatedBackground.jsx";
import HeroScene from "../components/HeroScene.jsx";
import { landingFeatures } from "../data/mockData.js";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      <AnimatedBackground />
      <section className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col gap-10 px-4 py-6 md:px-8 lg:px-12">
        <header className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Nexus Suite</p>
            <h1 className="text-lg font-semibold">Hostel & Mess Management</h1>
          </div>
          <Link to="/auth" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">
            Launch platform
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <Zap className="h-4 w-4" />
              Enterprise-grade campus operations
            </div>
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl xl:text-7xl"
              >
                Smart Hostel & Mess Management for Modern Institutions
              </motion.h2>
              <p className="max-w-2xl text-lg text-white/65 md:text-xl">
                Manage students, rooms, meals, fees, attendance, and complaints from a single platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-4 font-semibold text-slate-950 shadow-glow transition hover:scale-[1.01]">
                Start now <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#capabilities" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white/80 transition hover:bg-white/10">
                Explore modules
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Role-based access", text: "Secure portals for admins, staff, mess managers, and students." },
                { icon: Sparkles, title: "Realtime updates", text: "Notifications sync instantly through Supabase Realtime." },
                { icon: Zap, title: "3D premium UI", text: "Glassmorphism surfaces, motion, and immersive three.js visuals." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <Icon className="h-5 w-5 text-cyan-200" />
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <HeroScene />
            <div className="grid gap-4 sm:grid-cols-3">
              {landingFeatures.map((feature) => (
                <div key={feature.title} className="rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="font-semibold text-white">{feature.title}</p>
                  <p className="mt-2 text-sm text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-[1600px] px-4 pb-16 md:px-8 lg:px-12">
        <div className="grid gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl xl:grid-cols-4">
          {[
            "Hostel blocks, rooms, and beds",
            "Weekly meal plans and inventory",
            "Fee billing, dues, receipts, and alerts",
            "Reports with PDF and Excel exports",
          ].map((item) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-ink-900/60 p-5 text-sm text-white/70">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}