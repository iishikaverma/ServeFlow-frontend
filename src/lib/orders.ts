import type { Order } from "../services/types";

export interface DashboardStats {
  revenue: number;
  orderCount: number;
  avgTicket: number;
  topSeller: string | null;
}

export function computeStats(orders: Order[]): DashboardStats {
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const orderCount = orders.length;
  const avgTicket = orderCount ? revenue / orderCount : 0;

  const qtyByItem = new Map<string, number>();
  for (const o of orders) {
    for (const i of o.items) {
      qtyByItem.set(i.name, (qtyByItem.get(i.name) ?? 0) + i.quantity);
    }
  }
  let topSeller: string | null = null;
  let topQty = 0;
  for (const [name, qty] of qtyByItem) {
    if (qty > topQty) {
      topQty = qty;
      topSeller = name;
    }
  }

  return { revenue, orderCount, avgTicket, topSeller };
}

// Maps a backend status string to themed colors (uses CSS token vars).
export function statusStyle(status: string): {
  bg: string;
  color: string;
  label: string;
} {
  const s = status.toLowerCase();
  if (s === "paid")
    return { bg: "var(--success-soft)", color: "var(--success)", label: status };
  if (s === "preparing" || s === "pending")
    return { bg: "var(--warning-soft)", color: "var(--warning)", label: status };
  // Confirmed / default
  return { bg: "var(--accent-soft)", color: "var(--accent-text)", label: status };
}

// Short "2× Pizza · 1× Burger" summary, skipping zero-qty lines.
export function itemsSummary(order: Order): string {
  return order.items
    .filter((i) => i.quantity > 0)
    .map((i) => `${i.quantity}× ${i.name}`)
    .join(" · ");
}
