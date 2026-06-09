import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { moduleConfigs } from "../data/mockData.js";
import RoomGrid from "./RoomGrid.jsx";
import StatCard from "./StatCard.jsx";

function SimpleSection({ title, children, action }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/45">{title}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function ModulePage({ moduleKey }) {
  const config = moduleConfigs[moduleKey];
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: "", note: "" } });

  const filteredRows = useMemo(() => {
    if (!config?.table?.rows) {
      return [];
    }

    if (!search) {
      return config.table.rows;
    }

    return config.table.rows.filter((row) => row.join(" ").toLowerCase().includes(search.toLowerCase()));
  }, [config, search]);

  const onSubmit = handleSubmit((formData) => {
    void formData;
    reset();
  });

  if (!config) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-10">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Operations module</p>
            <h2 className="text-3xl font-semibold md:text-4xl">{config.title}</h2>
            <p className="max-w-2xl text-white/65">{config.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {config.filters?.map((filter) => (
              <span key={filter} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                {filter}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        {config.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} tone={config.accent} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
        <SimpleSection title="Quick actions">
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input {...register("name")} placeholder={`New ${config.title.toLowerCase()} entry`} className="glass-input" />
            <input {...register("note")} placeholder="Short note" className="glass-input" />
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple px-5 py-3 font-semibold text-slate-950">
              Save
            </button>
          </form>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {config.cards?.slice(0, 4).map((card) => (
              <div key={card.label || card.title || card.name} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/45">{card.label || card.title || card.item || card.student || card.day}</p>
                <p className="mt-2 text-xl font-semibold text-white">{card.value || card.room || card.status || card.stock || card.amount || card.name || card.breakfast}</p>
                <p className="mt-1 text-sm text-white/55">{card.note || card.priority || card.trend || card.contact || card.method || card.attendance || card.breakfast}</p>
              </div>
            ))}
          </div>
        </SimpleSection>

        <SimpleSection title="Search">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records..." className="glass-input w-full" />
          <div className="mt-4 space-y-3">
            {(config.complaints || config.payments || []).map((item) => (
              <div key={item.title || item.student} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">{item.title || item.student}</p>
                <p className="text-sm text-white/55">{item.status || item.amount} {item.priority ? `• ${item.priority}` : ""}</p>
              </div>
            ))}
          </div>
        </SimpleSection>
      </div>

      {config.table ? (
        <SimpleSection title="Records">
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-white/55">
                <tr>
                  {config.table.columns.map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-ink-900/70">
                {filteredRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="transition hover:bg-white/5">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-white/80">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SimpleSection>
      ) : null}

      {config.roomGrid ? <RoomGrid grid={config.roomGrid} /> : null}

      {config.menu ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <SimpleSection title="Weekly menu planner">
            <div className="space-y-3">
              {config.menu.map((item) => (
                <div key={item.day} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/45">{item.day}</p>
                  <p className="mt-2 text-white">Breakfast: {item.breakfast}</p>
                  <p className="text-white/70">Lunch: {item.lunch}</p>
                  <p className="text-white/70">Dinner: {item.dinner}</p>
                </div>
              ))}
            </div>
          </SimpleSection>

          <SimpleSection title="Inventory tracking">
            <div className="space-y-3">
              {config.inventory.map((item) => (
                <div key={item.item} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{item.item}</p>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{item.trend}</span>
                  </div>
                  <p className="mt-2 text-white/65">Current stock: {item.stock}</p>
                </div>
              ))}
            </div>
          </SimpleSection>
        </div>
      ) : null}

      {config.exports ? (
        <SimpleSection title="Export actions">
          <div className="flex flex-wrap gap-3">
            {config.exports.map((entry) => (
              <button key={entry} type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition hover:bg-white/10">
                {entry}
              </button>
            ))}
          </div>
        </SimpleSection>
      ) : null}
    </motion.div>
  );
}