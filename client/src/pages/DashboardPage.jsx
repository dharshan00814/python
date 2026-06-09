import { motion } from "framer-motion";
import { Bell, FileText, MoreHorizontal } from "lucide-react";

import DashboardCharts from "../components/DashboardCharts.jsx";
import StatCard from "../components/StatCard.jsx";
import { dashboardFeed, dashboardMetrics, feeSeries, occupancySeries } from "../data/mockData.js";

export default function DashboardPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-10">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Command center</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Executive dashboard</h2>
            <p className="mt-3 max-w-2xl text-white/65">Monitor the health of the hostel, mess, and finance operations from one premium analytics cockpit.</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <FileText className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <Bell className="h-4 w-4" /> Notifications
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <MoreHorizontal className="h-4 w-4" /> More
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} tone={metric.tone} />
        ))}
      </div>

      <DashboardCharts occupancySeries={occupancySeries} feeSeries={feeSeries} />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
          <p className="text-sm text-white/45">Realtime feed</p>
          <h3 className="text-xl font-semibold">Operational events</h3>
          <div className="mt-4 space-y-3">
            {dashboardFeed.map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-ink-900/60 p-4 text-white/75">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
          <p className="text-sm text-white/45">System status</p>
          <h3 className="text-xl font-semibold">Deployment summary</h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-ink-900/60 px-4 py-3">
              <span>Supabase Auth</span>
              <span className="text-emerald-300">Connected</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-ink-900/60 px-4 py-3">
              <span>Realtime notifications</span>
              <span className="text-emerald-300">Ready</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-ink-900/60 px-4 py-3">
              <span>RLS policies</span>
              <span className="text-emerald-300">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-ink-900/60 px-4 py-3">
              <span>API health</span>
              <span className="text-emerald-300">Stable</span>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}