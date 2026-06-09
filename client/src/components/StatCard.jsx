import { motion } from "framer-motion";

const toneClasses = {
  blue: "from-cyan-400/20 to-blue-500/10 border-cyan-300/20",
  purple: "from-violet-400/20 to-fuchsia-500/10 border-violet-300/20",
  aqua: "from-emerald-400/20 to-cyan-500/10 border-emerald-300/20",
};

export default function StatCard({ label, value, delta, tone = "blue" }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`rounded-[24px] border bg-gradient-to-br p-[1px] shadow-xl ${toneClasses[tone] || toneClasses.blue}`}
    >
      <div className="rounded-[23px] border border-white/6 bg-ink-900/80 p-5 backdrop-blur-xl">
        <p className="text-sm text-white/55">{label}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
          {delta ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">{delta}</span> : null}
        </div>
      </div>
    </motion.div>
  );
}