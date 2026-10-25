import type {
  CreateOrderRequest,
  CreateOrderResponse,
  MenuItem,
  Order,
  PaymentMethod,
  PaymentResponse,
} from "./types";
import { mockMenu, mockOrders } from "./mockData";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:18080";

const FORCE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// --- Data-source status (so the UI can show a "demo data" banner) ------------

export type DataMode = "unknown" | "live" | "mock";

let currentMode: DataMode = FORCE_MOCK ? "mock" : "unknown";
const listeners = new Set<(mode: DataMode) => void>();

function setMode(mode: DataMode) {
  if (mode === currentMode) return;
  currentMode = mode;
  listeners.forEach((fn) => fn(mode));
}

export function getDataMode(): DataMode {
  return currentMode;
}

export function subscribeDataMode(fn: (mode: DataMode) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// --- Fetch helper with graceful fallback -------------------------------------

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      message = (await res.text()) || message;
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  setMode("live");
  return res.json() as Promise<T>;
}

// Clone so callers never mutate the shared mock arrays.
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// --- Public API --------------------------------------------------------------

export async function getMenu(): Promise<MenuItem[]> {
  if (FORCE_MOCK) return clone(mockMenu);
  try {
    return await request<MenuItem[]>("/api/menu");
  } catch {
    setMode("mock");
    return clone(mockMenu);
  }
}

export async function getOrders(): Promise<Order[]> {
  if (FORCE_MOCK) return clone(mockOrders);
  try {
    return await request<Order[]>("/api/orders");
  } catch {
    setMode("mock");
    return clone(mockOrders);
  }
}

export async function createOrder(
  body: CreateOrderRequest
): Promise<CreateOrderResponse> {
  if (FORCE_MOCK || currentMode === "mock") {
    setMode("mock");
    const total = body.items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { message: "Order created (demo)", orderId: body.orderId, total };
  }
  try {
    return await request<CreateOrderResponse>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    setMode("mock");
    const total = body.items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { message: "Order created (demo)", orderId: body.orderId, total };
  }
}

export async function payOrder(
  orderId: number,
  method: PaymentMethod,
  // fallback amount for demo mode, since there's no server to recompute it
  fallbackAmount = 0
): Promise<PaymentResponse> {
  if (FORCE_MOCK || currentMode === "mock") {
    setMode("mock");
    return {
      message: "Payment processed (demo)",
      orderId,
      paymentMethod: method,
      amount: fallbackAmount,
      status: "Paid",
    };
  }
  try {
    return await request<PaymentResponse>(`/api/orders/${orderId}/payment`, {
      method: "POST",
      body: JSON.stringify({ method }),
    });
  } catch {
    setMode("mock");
    return {
      message: "Payment processed (demo)",
      orderId,
      paymentMethod: method,
      amount: fallbackAmount,
      status: "Paid",
    };
  }
}
