import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Receipt, Wallet, Flame, BarChart3 } from "lucide-react";
import { getMenu, getOrders } from "../services/api";
import type { MenuItem, Order } from "../services/types";
import { computeStats } from "../lib/orders";
import { formatINR } from "../lib/format";
import {
  revenueByOrder,
  revenueByCategory,
  topSellers,
  CATEGORY_COLORS,
  type NamedValue,
} from "../lib/analytics";

function Analytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getMenu()])
      .then(([o, m]) => {
        setOrders(o);
        setMenu(m);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = computeStats(orders);
  const byOrder = revenueByOrder(orders);
  const byCategory = revenueByCategory(orders, menu);
  const sellers = topSellers(orders);

  const kpis = [
    { label: "Total revenue", value: formatINR(stats.revenue), icon: TrendingUp },
    { label: "Orders", value: String(stats.orderCount), icon: Receipt },
    { label: "Avg ticket", value: formatINR(stats.avgTicket), icon: Wallet },
    { label: "Top seller", value: stats.topSeller ?? "—", icon: Flame, small: true },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[86px] animate-pulse rounded-2xl"
              style={{ background: "var(--surface-2)" }}
            />
          ))}
        </div>
        <div
          className="mt-8 h-80 animate-pulse rounded-2xl"
          style={{ background: "var(--surface-2)" }}
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <BarChart3 size={30} style={{ color: "var(--text-faint)" }} />
        <h1 className="mt-4 text-xl font-bold">No data yet</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Place a few orders and analytics will appear here.
        </p>
        <Link
          to="/order"
          className="mt-5 inline-block rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          New order
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Computed live from the orders board.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <k.icon size={15} />
              <span className="text-[13px]">{k.label}</span>
            </div>
            <p className={`tnum mt-2 font-bold ${k.small ? "text-lg" : "text-2xl"}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue by order">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byOrder} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "var(--accent-soft)" }}
                contentStyle={tooltipStyle}
                formatter={(v) => [formatINR(Number(v)), "Revenue"]}
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by category">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="var(--surface)"
                  strokeWidth={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatINR(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
            <Legend data={byCategory} />
          </div>
        </ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Top sellers (by quantity)">
          <ResponsiveContainer width="100%" height={Math.max(sellers.length * 46 + 20, 120)}>
            <BarChart
              data={sellers}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--accent-soft)" }}
                contentStyle={tooltipStyle}
                formatter={(v) => [`${Number(v)} sold`, ""]}
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 13,
  color: "var(--text)",
};

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Legend({ data }: { data: NamedValue[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="flex-1 space-y-2">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
          />
          <span className="flex-1 truncate" style={{ color: "var(--text-muted)" }}>
            {d.name}
          </span>
          <span className="tnum font-medium" style={{ color: "var(--text-faint)" }}>
            {Math.round((d.value / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default Analytics;
