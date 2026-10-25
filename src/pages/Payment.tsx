import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { getOrders, payOrder } from "../services/api";
import type { PaymentMethod } from "../services/types";
import { formatINR } from "../lib/format";
import { useToast } from "../components/ui/Toast";

const METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "cash", label: "Cash", icon: Banknote },
];

type Stage = "select" | "processing" | "done";

function Payment() {
  const { id } = useParams();
  const orderId = Number(id);
  const location = useLocation();
  const toast = useToast();

  const stateAmount = (location.state as { amount?: number; name?: string } | null)
    ?.amount;
  const stateName = (location.state as { name?: string } | null)?.name;

  const [amount, setAmount] = useState<number | null>(stateAmount ?? null);
  const [name, setName] = useState<string | undefined>(stateName);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [stage, setStage] = useState<Stage>("select");
  const [notFound, setNotFound] = useState(false);

  // If we weren't handed the amount (e.g. arriving from the dashboard), look it up.
  useEffect(() => {
    if (amount != null) return;
    getOrders().then((orders) => {
      const found = orders.find((o) => o.orderId === orderId);
      if (found) {
        setAmount(found.total);
        setName(found.customer.name);
      } else {
        setNotFound(true);
      }
    });
  }, [amount, orderId]);

  async function pay() {
    setStage("processing");
    const [res] = await Promise.all([
      payOrder(orderId, method, amount ?? 0),
      new Promise((r) => setTimeout(r, 1300)), // let the animation breathe
    ]);
    setStage("done");
    toast.success(`Payment received · ${res.paymentMethod.toUpperCase()}`);
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <h1 className="text-xl font-bold">Order #{orderId} not found</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          It may not exist yet in demo mode.
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-block rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={15} /> Dashboard
      </Link>

      <div
        className="rounded-2xl border p-7"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Order #{orderId}
            {name ? ` · ${name}` : ""}
          </p>
          <p className="tnum mt-1 text-4xl font-extrabold">
            {amount == null ? "…" : formatINR(amount)}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {stage === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p
                className="mt-7 mb-3 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-faint)" }}
              >
                Payment method
              </p>
              <div className="grid grid-cols-3 gap-3">
                {METHODS.map((m) => {
                  const active = m.id === method;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className="flex flex-col items-center gap-2 rounded-xl border py-4 transition-colors"
                      style={{
                        borderColor: active ? "var(--accent)" : "var(--border-strong)",
                        background: active ? "var(--accent-soft)" : "var(--surface-2)",
                        color: active ? "var(--accent-text)" : "var(--text-muted)",
                      }}
                    >
                      <m.icon size={22} />
                      <span className="text-sm font-medium">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={pay}
                disabled={amount == null}
                className="mt-7 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "var(--accent)" }}
              >
                Pay {amount == null ? "" : formatINR(amount)}
              </button>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-12"
            >
              <Loader2 size={40} className="animate-spin" style={{ color: "var(--accent)" }} />
              <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
                Processing {method.toUpperCase()} payment…
              </p>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "var(--success-soft)", color: "var(--success)" }}
              >
                <Check size={32} />
              </motion.div>
              <p className="mt-4 text-lg font-bold">Payment received</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Order #{orderId} marked as paid.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  to="/dashboard"
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  Back to dashboard
                </Link>
                <Link
                  to="/order"
                  className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
                  style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
                >
                  New order
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Payment;
