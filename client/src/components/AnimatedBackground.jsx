import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(102,217,255,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(157,125,255,0.18),transparent_32%),linear-gradient(180deg,rgba(5,8,22,0.96),rgba(5,8,22,0.88))]" />
      <div className="absolute inset-0 bg-hero-grid bg-[size:72px_72px] opacity-20" />
      {[
        { className: "left-[8%] top-[16%] h-40 w-40 bg-neon-blue/20" },
        { className: "right-[12%] top-[10%] h-56 w-56 bg-neon-purple/20" },
        { className: "bottom-[12%] left-[22%] h-44 w-44 bg-neon-aqua/20" },
      ].map((blob, index) => (
        <motion.div
          key={blob.className}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          animate={{ y: [0, -18, 0], x: [0, 10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9 + index * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}