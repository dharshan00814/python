import { ChevronRight, LogOut, Menu, Shield, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { navItems } from "../data/mockData.js";
import { useAuth } from "../context/AuthContext.jsx";
import clsx from "clsx";

const iconMap = {
  sparkles: Sparkles,
  users: Shield,
  building: Shield,
  utensils: Shield,
  wallet: Shield,
  "message-square": Shield,
  "bar-chart-3": Shield,
  settings: Shield,
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const crumbs = useMemo(
    () => location.pathname.split("/").filter(Boolean).slice(1),
    [location.pathname],
  );

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(102,217,255,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(157,125,255,0.12),transparent_26%),linear-gradient(180deg,#050816,#091127_56%,#050816)]" />
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-4 p-4 md:p-6">
        <aside className={clsx("glass-panel hidden shrink-0 rounded-[28px] border border-white/10 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 lg:flex lg:flex-col", collapsed ? "w-[90px]" : "w-[280px]") }>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <Link to="/app/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-aqua text-slate-950 shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">Nexus Hostel</p>
                  <p className="text-lg font-semibold">Control Center</p>
                </div>
              )}
            </Link>
            <button type="button" onClick={() => setCollapsed((value) => !value)} className="rounded-xl border border-white/10 p-2 text-white/70 transition hover:bg-white/10">
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-5 flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || Sparkles;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                      isActive ? "bg-white/12 text-white shadow-glow" : "text-white/60 hover:bg-white/6 hover:text-white",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && <ChevronRight className="ml-auto h-4 w-4 opacity-40" />}
                </NavLink>
              );
            })}
          </nav>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Signed in</p>
            <p className="mt-2 text-lg font-semibold">{user?.name || "Campus Admin"}</p>
            <p className="text-sm text-white/55">{user?.role || "Hostel Admin"}</p>
            <button type="button" onClick={signOut} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 space-y-4">
          <header className="glass-panel flex items-center justify-between rounded-[28px] border border-white/10 px-5 py-4 backdrop-blur-2xl">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">{crumbs.length ? crumbs.join(" / ") : "overview"}</p>
              <h1 className="mt-1 text-xl font-semibold md:text-2xl">Hostel & Mess Management Platform</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">{user?.email || "demo@campus.edu"}</div>
              <div className="rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-2 text-sm font-semibold text-slate-950">{user?.role || "Hostel Admin"}</div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}