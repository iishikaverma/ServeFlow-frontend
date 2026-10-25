import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { createOrder, getMenu, getOrders } from "../services/api";
import type { MenuItem } from "../services/types";
import { formatINR } from "../lib/format";
import { useToast } from "../components/ui/Toast";

interface CartLine {
  item: MenuItem;
  qty: number;
}

function NewOrder() {
  const navigate = useNavigate();
  const toast = useToast();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<number, CartLine>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nextOrderId, setNextOrderId] = useState(5001);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([getMenu(), getOrders()])
      .then(([m, orders]) => {
        setMenu(m);
        const maxId = orders.reduce((mx, o) => Math.max(mx, o.orderId), 5000);
        setNextOrderId(maxId + 1);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menu) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return [...map.entries()];
  }, [menu]);

  const lines = Object.values(cart);
  const total = lines.reduce((s, l) => s + l.item.price * l.qty, 0);

  function add(item: MenuItem) {
    setCart((c) => ({
      ...c,
      [item.id]: { item, qty: (c[item.id]?.qty ?? 0) + 1 },
    }));
  }
  function dec(id: number) {
    setCart((c) => {
      const line = c[id];
      if (!line) return c;
      if (line.qty <= 1) {
        const { [id]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: { ...line, qty: line.qty - 1 } };
    });
  }
  function remove(id: number) {
    setCart((c) => {
      const { [id]: _, ...rest } = c;
      return rest;
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Enter a name";
    if (!/^\d{10}$/.test(phone.trim())) e.phone = "Enter a 10-digit phone";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email";
    if (lines.length === 0) e.cart = "Add at least one item";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function place() {
    if (!validate()) return;
    setSubmitting(true);
    const orderId = nextOrderId;
    try {
      await createOrder({
        orderId,
        customer: {
          id: Math.floor(Math.random() * 900) + 100,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
        items: lines.map((l) => ({
          id: l.item.id,
          name: l.item.name,
          category: l.item.category,
          price: l.item.price,
          quantity: l.qty,
        })),
      });
      toast.success(`Order #${orderId} placed`);
      navigate(`/order/${orderId}/pay`, {
        state: { amount: total, name: name.trim() },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl font-bold tracking-tight">New order</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Tap items to build the order, then add customer details.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Menu */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl"
                  style={{ background: "var(--surface-2)" }}
                />
              ))}
            </div>
          ) : (
            categories.map(([cat, items]) => (
              <div key={cat} className="mb-6">
                <h2
                  className="mb-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-faint)" }}
                >
                  {cat}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => add(item)}
                      className="flex flex-col items-start rounded-xl border p-3 text-left transition-transform hover:-translate-y-0.5"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      <span className="text-sm font-medium">{item.name}</span>
                      <span
                        className="tnum mt-auto pt-3 text-sm font-semibold"
                        style={{ color: "var(--accent-text)" }}
                      >
                        {formatINR(item.price)}
                      </span>
                      {cart[item.id] && (
                        <span
                          className="mt-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}
                        >
                          {cart[item.id].qty} in cart
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Cart + customer */}
        <section className="lg:sticky lg:top-20 lg:self-start">
          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={17} style={{ color: "var(--accent)" }} />
              <h2 className="font-semibold">Current order</h2>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-xs"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                #{nextOrderId}
              </span>
            </div>

            {lines.length === 0 ? (
              <p className="mt-4 text-sm" style={{ color: "var(--text-faint)" }}>
                No items yet. Tap the menu to add.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {lines.map((l) => (
                  <div key={l.item.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{l.item.name}</p>
                      <p className="tnum text-xs" style={{ color: "var(--text-faint)" }}>
                        {formatINR(l.item.price)} × {l.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StepBtn onClick={() => dec(l.item.id)}>
                        <Minus size={14} />
                      </StepBtn>
                      <span className="tnum w-5 text-center text-sm font-semibold">
                        {l.qty}
                      </span>
                      <StepBtn onClick={() => add(l.item)}>
                        <Plus size={14} />
                      </StepBtn>
                      <button
                        onClick={() => remove(l.item.id)}
                        aria-label="Remove"
                        className="ml-1"
                        style={{ color: "var(--text-faint)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.cart && <FieldError>{errors.cart}</FieldError>}

            <div
              className="mt-4 flex items-center justify-between border-t pt-4"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Total
              </span>
              <span className="tnum text-xl font-bold">{formatINR(total)}</span>
            </div>

            {/* Customer */}
            <div className="mt-5 space-y-3">
              <Field label="Customer name" error={errors.name}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="input"
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  inputMode="numeric"
                  className="input"
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="input"
                />
              </Field>
            </div>

            <button
              onClick={place}
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              style={{ background: "var(--accent)" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Placing…
                </>
              ) : (
                <>Place order · {formatINR(total)}</>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function StepBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg border"
      style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>
      {children}
    </p>
  );
}

export default NewOrder;
