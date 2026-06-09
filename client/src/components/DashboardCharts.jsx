import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = ["#66d9ff", "#9d7dff", "#3cf2d8"];

export default function DashboardCharts({ occupancySeries, feeSeries }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/45">Occupancy trend</p>
            <h2 className="text-xl font-semibold">Hostel utilization</h2>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Live analytics</div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={occupancySeries}>
              <defs>
                <linearGradient id="occupiedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#66d9ff" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#66d9ff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" />
              <YAxis stroke="rgba(255,255,255,0.35)" />
              <Tooltip contentStyle={{ background: "#0a1020", border: "1px solid rgba(255,255,255,0.08)" }} />
              <Area type="monotone" dataKey="occupied" stroke="#66d9ff" fill="url(#occupiedFill)" strokeWidth={3} />
              <Area type="monotone" dataKey="available" stroke="#3cf2d8" fillOpacity={0} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/45">Revenue mix</p>
              <h2 className="text-xl font-semibold">Fee collection</h2>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeSeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" />
                <YAxis stroke="rgba(255,255,255,0.35)" />
                <Tooltip contentStyle={{ background: "#0a1020", border: "1px solid rgba(255,255,255,0.08)" }} />
                <Bar dataKey="collected" radius={[12, 12, 0, 0]} fill="#9d7dff" />
                <Bar dataKey="pending" radius={[12, 12, 0, 0]} fill="#66d9ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
          <p className="text-sm text-white/45">Operational split</p>
          <h2 className="text-xl font-semibold">Room status</h2>
          <div className="mt-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ name: "Occupied", value: 184 }, { name: "Available", value: 16 }, { name: "Maintenance", value: 10 }]} dataKey="value" innerRadius={52} outerRadius={84} paddingAngle={4}>
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={entry} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a1020", border: "1px solid rgba(255,255,255,0.08)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}