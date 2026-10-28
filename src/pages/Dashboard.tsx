import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Receipt,
  Wallet,
  Flame,
  ClipboardList,
  Plus,
  Search,
  X,
  SearchX,
} from "lucide-react";
import { getMenu, getOrders } from "../services/api";
import type { MenuItem, Order } from "../services/types";
import { computeStats, itemsSummary, statusStyle } from "../lib/orders";
import { formatINR, initials } from "../lib/format";

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Orders board controls
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("All");
  const [orderSort, setOrderSort] = useState("newest");

  // Menu controls
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState("All");
  const [menuSort, setMenuSort] = useState("name");

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

  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(orders.map((o) => o.status)))],
    [orders]
  );
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu]
  );

  const visibleOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    const list = orders.filter((o) => {
      if (orderStatus !== "All" && o.status !== orderStatus) return false;
      if (!q) return true;
      return (
        o.customer.name.toLowerCase().includes(q) ||
        String(o.orderId).includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });
    return [...list].sort((a, b) => {
      if (orderSort === "total-desc") return b.total - a.total;
      if (orderSort === "total-asc") return a.total - b.total;
      return b.orderId - a.orderId; // newest first
    });
  }, [orders, orderSearch, orderStatus, orderSort]);

  const visibleMenu = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    const list = menu.filter((m) => {
      if (menuCategory !== "All" && m.category !== menuCategory) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
      );
    });
    return [...list].sort((a, b) => {
      if (menuSort === "price-asc") return a.price - b.price;
      if (menuSort === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }, [menu, menuSearch, menuCategory, menuSort]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Service dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Live orders, revenue, and menu at a glance.
        </p>
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
                <p className={`tnum mt-2 font-bold ${k.small ? "text-lg" : "text-2xl"}`}>
                  {k.value}
                </p>
              </div>
            ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Orders board */}
        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} style={{ color: "var(--text-muted)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                Live orders
              </h2>
              {!loading && orders.length > 0 && (
                <span
                  className="tnum rounded-full px-2 py-0.5 text-xs"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                >
                  {visibleOrders.length}
                </span>
              )}
            </div>

            {!loading && orders.length > 0 && (
              <div className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <SearchBox
                  value={orderSearch}
                  onChange={setOrderSearch}
                  placeholder="Search orders…"
                />
                <select
                  className="select"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  aria-label="Filter by status"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "All statuses" : s}
                    </option>
                  ))}
                </select>
                <select
                  className="select"
                  value={orderSort}
                  onChange={(e) => setOrderSort(e.target.value)}
                  aria-label="Sort orders"
                >
                  <option value="newest">Newest</option>
                  <option value="total-desc">Total: high → low</option>
                  <option value="total-asc">Total: low → high</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : visibleOrders.length === 0 ? (
            <NoMatches
              onClear={() => {
                setOrderSearch("");
                setOrderStatus("All");
              }}
            />
          ) : (
            <div className="space-y-3">
              {visibleOrders.map((o) => (
                <OrderCard key={o.orderId} order={o} />
              ))}
            </div>
          )}
        </section>

        {/* Menu */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              Menu
            </h2>
            {!loading && menu.length > 0 && (
              <span
                className="tnum rounded-full px-2 py-0.5 text-xs"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                {visibleMenu.length}
              </span>
            )}
          </div>

          {!loading && menu.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <SearchBox
                value={menuSearch}
                onChange={setMenuSearch}
                placeholder="Search menu…"
              />
              <select
                className="select"
                value={menuCategory}
                onChange={(e) => setMenuCategory(e.target.value)}
                aria-label="Filter by category"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All categories" : c}
                  </option>
                ))}
              </select>
              <select
                className="select"
                value={menuSort}
                onChange={(e) => setMenuSort(e.target.value)}
                aria-label="Sort menu"
              >
                <option value="name">Name</option>
                <option value="price-asc">Price: low → high</option>
                <option value="price-desc">Price: high → low</option>
              </select>
            </div>
          )}

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
          ) : visibleMenu.length === 0 ? (
            <NoMatches
              onClear={() => {
                setMenuSearch("");
                setMenuCategory("All");
              }}
            />
          ) : (
            <div className="space-y-2">
              {visibleMenu.map((item) => (
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

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:w-44">
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--text-faint)" }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
        style={{ paddingLeft: "2rem", paddingRight: value ? "2rem" : undefined }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-faint)" }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center"
      style={{ borderColor: "var(--border-strong)" }}
    >
      <SearchX size={24} style={{ color: "var(--text-faint)" }} />
      <p className="mt-3 text-sm font-medium">No matches</p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Try a different search or filter.
      </p>
      <button
        onClick={onClear}
        className="mt-4 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors"
        style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
      >
        Clear filters
      </button>
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
