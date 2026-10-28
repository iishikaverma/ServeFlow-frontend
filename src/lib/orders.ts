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

// Order lifecycle colours. Light tints + dark text read well in both themes.
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  received: { bg: "#F1EFE8", color: "#5F5E5A" }, // new order
  preparing: { bg: "#FAEEDA", color: "#854F0B" }, // being made
  ready: { bg: "#E6F1FB", color: "#185FA5" }, // ready to serve
  completed: { bg: "#EAF3DE", color: "#3B6D11" }, // delivered / done
};

export function statusStyle(status: string): {
  bg: string;
  color: string;
  label: string;
} {
  const style =
    STATUS_COLORS[status.toLowerCase()] ?? {
      bg: "var(--accent-soft)",
      color: "var(--accent-text)",
    };
  return { ...style, label: status };
}

// Short "2× Pizza · 1× Burger" summary, skipping zero-qty lines.
export function itemsSummary(order: Order): string {
  return order.items
    .filter((i) => i.quantity > 0)
    .map((i) => `${i.quantity}× ${i.name}`)
    .join(" · ");
}
