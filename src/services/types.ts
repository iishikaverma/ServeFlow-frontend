// Shapes mirror the ServeFlow C++ API (Crow) exactly.

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface OrderLineItem {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Paid";

export interface Order {
  orderId: number;
  status: OrderStatus | string;
  total: number;
  customer: Customer;
  items: OrderLineItem[];
}

// POST /api/orders body
export interface CreateOrderItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface CreateOrderRequest {
  orderId: number;
  customer: Customer;
  items: CreateOrderItem[];
}

export interface CreateOrderResponse {
  message: string;
  orderId: number;
  total: number;
}

export type PaymentMethod = "cash" | "card" | "upi";

export interface PaymentResponse {
  message: string;
  orderId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  status: string;
}
