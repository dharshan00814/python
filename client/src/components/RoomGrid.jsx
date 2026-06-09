import clsx from "clsx";

const statusClasses = {
  available: "bg-emerald-400/18 text-emerald-200 border-emerald-300/20",
  occupied: "bg-rose-400/18 text-rose-200 border-rose-300/20",
  maintenance: "bg-amber-400/18 text-amber-200 border-amber-300/20",
};

export default function RoomGrid({ grid }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/45">Visual occupancy map</p>
          <h2 className="text-xl font-semibold">Room grid</h2>
        </div>
        <div className="flex gap-3 text-xs text-white/55">
          {Object.entries(statusClasses).map(([status, className]) => (
            <span key={status} className={clsx("rounded-full border px-3 py-1 capitalize", className)}>
              {status}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {grid.flat().map((status, index) => (
          <div key={`${status}-${index}`} className={clsx("flex min-h-24 items-center justify-center rounded-3xl border p-4 text-sm font-medium capitalize backdrop-blur-xl", statusClasses[status])}>
            {status}
          </div>
        ))}
      </div>
    </div>
  );
}