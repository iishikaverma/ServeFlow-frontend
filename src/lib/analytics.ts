import type { MenuItem, Order } from "../services/types";

export interface NamedValue {
  name: string;
  value: number;
}

// Revenue per order, for the bar chart.
export function revenueByOrder(orders: Order[]): NamedValue[] {
  return orders.map((o) => ({ name: `#${o.orderId}`, value: o.total }));
}

// Revenue share by menu category. OrderLineItems don't carry a category,
// so we map item name -> category via the menu.
export function revenueByCategory(
  orders: Order[],
  menu: MenuItem[]
): NamedValue[] {
  const catOf = new Map(menu.map((m) => [m.name, m.category]));
  const totals = new Map<string, number>();
  for (const o of orders) {
    for (const i of o.items) {
      if (i.quantity <= 0) continue;
      const cat = catOf.get(i.name) ?? "Other";
      totals.set(cat, (totals.get(cat) ?? 0) + i.subtotal);
    }
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Top-selling items by quantity.
export function topSellers(orders: Order[], limit = 5): NamedValue[] {
  const qty = new Map<string, number>();
  for (const o of orders) {
    for (const i of o.items) {
      if (i.quantity <= 0) continue;
      qty.set(i.name, (qty.get(i.name) ?? 0) + i.quantity);
    }
  }
  return [...qty.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

// Cove categorical palette (fixed order, never cycled).
export const CATEGORY_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#6250d6",
  "#e34948",
  "#008300",
];
