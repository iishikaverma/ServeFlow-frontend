import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Receipt,
  Wallet,
  Flame,
  ClipboardList,
  Plus,
} from "lucide-react";
import { getMenu, getOrders } from "../services/api";
import type { MenuItem, Order } from "../services/types";
import { computeStats, itemsSummary, statusStyle } from "../lib/orders";
import { formatINR, initials } from "../lib/format";

function Dashboard() {
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

  const kpis = [
    { label: "Revenue today", value: formatINR(stats.revenue), icon: TrendingUp },
    { label: "Orders", value: String(stats.orderCount), icon: Receipt },
    { label: "Avg ticket", value: formatINR(stats.avgTicket), icon: Wallet },
    { label: "Top seller", value: stats.topSeller ?? "—", icon: Flame, small: true },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Live orders, revenue, and menu at a glance.
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-2xl border p-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <k.icon size={15} />
                  <span className="text-[13px]">{k.label}</span>
                </div>
                <p
                  className={`tnum mt-2 font-bold ${k.small ? "text-lg" : "text-2xl"}`}
                >
                  {k.value}
                </p>
              </div>
            ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Orders board */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList size={16} style={{ color: "var(--text-muted)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              Live orders
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <OrderCard key={o.orderId} order={o} />
              ))}
            </div>
          )}
        </section>

        {/* Menu */}
        <section>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            Menu
          </h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl"
                  style={{ background: "var(--surface-2)" }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                      {item.category}
                    </p>
                  </div>
                  <span className="tnum font-semibold" style={{ color: "var(--accent-text)" }}>
                    {formatINR(item.price)}
                  </span>
                </div>
              ))}
              <Link
                to="/order"
                className="mt-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors"
                style={{ borderColor: "var(--border-strong)", color: "var(--accent-text)" }}
              >
                <Plus size={16} />
                New order
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const st = statusStyle(order.status);
  return (
    <Link
      to={`/order/${order.orderId}/pay`}
      className="block rounded-2xl border p-4 transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}
          >
            {initials(order.customer.name)}
          </span>
          <div>
            <p className="text-sm font-semibold">{order.customer.name}</p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              Order #{order.orderId}
            </p>
          </div>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: st.bg, color: st.color }}
        >
          {st.label}
        </span>
      </div>
      <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
        {itemsSummary(order)}
      </p>
      <div
        className="mt-3 flex items-center justify-between border-t pt-3"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
          {order.customer.phone}
        </span>
        <span className="tnum text-sm font-bold">{formatINR(order.total)}</span>
      </div>
    </Link>
  );
}

function EmptyOrders() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center"
      style={{ borderColor: "var(--border-strong)" }}
    >
      <ClipboardList size={28} style={{ color: "var(--text-faint)" }} />
      <p className="mt-3 font-semibold">No orders yet</p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Take the first order to see it appear here live.
      </p>
      <Link
        to="/order"
        className="mt-5 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--accent)" }}
      >
        <Plus size={16} /> New order
      </Link>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div
      className="h-[86px] animate-pulse rounded-2xl"
      style={{ background: "var(--surface-2)" }}
    />
  );
}

function OrderSkeleton() {
  return (
    <div
      className="h-[132px] animate-pulse rounded-2xl"
      style={{ background: "var(--surface-2)" }}
    />
  );
}

export default Dashboard;
