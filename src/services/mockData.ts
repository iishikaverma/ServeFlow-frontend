import type { MenuItem, Order } from "./types";

// Demo data matching the backend's data/menu.json and data/orders.json shapes,
// so the portfolio site renders fully even with no C++ server running.

export const mockMenu: MenuItem[] = [
  { id: 1, name: "Margherita Pizza", category: "Pizza", price: 249 },
  { id: 2, name: "Classic Burger", category: "Burgers", price: 199 },
  { id: 3, name: "White Sauce Pasta", category: "Pasta", price: 229 },
  { id: 4, name: "Paneer Tikka", category: "Starters", price: 189 },
  { id: 5, name: "Cold Coffee", category: "Beverages", price: 119 },
  { id: 6, name: "Chocolate Brownie", category: "Desserts", price: 149 },
];

export const mockOrders: Order[] = [
  {
    orderId: 5001,
    status: "Confirmed",
    total: 697,
    customer: {
      id: 101,
      name: "Rahul Sharma",
      phone: "9876543210",
      email: "rahul@example.com",
    },
    items: [
      { name: "Margherita Pizza", price: 249, quantity: 2, subtotal: 498 },
      { name: "Classic Burger", price: 199, quantity: 1, subtotal: 199 },
    ],
  },
  {
    orderId: 5002,
    status: "Preparing",
    total: 567,
    customer: {
      id: 102,
      name: "Aman Verma",
      phone: "9876543211",
      email: "aman@example.com",
    },
    items: [
      { name: "White Sauce Pasta", price: 229, quantity: 1, subtotal: 229 },
      { name: "Paneer Tikka", price: 189, quantity: 1, subtotal: 189 },
      { name: "Cold Coffee", price: 119, quantity: 1, subtotal: 119 },
    ],
  },
  {
    orderId: 5003,
    status: "Paid",
    total: 398,
    customer: {
      id: 103,
      name: "Sneha Iyer",
      phone: "9876543212",
      email: "sneha@example.com",
    },
    items: [
      { name: "Margherita Pizza", price: 249, quantity: 1, subtotal: 249 },
      { name: "Chocolate Brownie", price: 149, quantity: 1, subtotal: 149 },
    ],
  },
];
