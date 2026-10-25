import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Zap,
  WifiOff,
} from "lucide-react";
import { getOrders } from "../services/api";
import type { Order } from "../services/types";
import { formatINR, initials } from "../lib/format";
import { itemsSummary, statusStyle } from "../lib/orders";

const features = [
  {
    icon: ClipboardList,
    title: "Live orders board",
    body: "Every order with its items, customer, status, and total — updated as service runs.",
  },
  {
    icon: ShoppingCart,
    title: "Fast POS order flow",
    body: "Tap the menu to build an order, add the customer, and place it in seconds.",
  },
  {
    icon: CreditCard,
    title: "Cash, card & UPI",
    body: "Process payments with an animated, state-driven checkout for each method.",
  },
  {
    icon: BarChart3,
    title: "Service analytics",
    body: "Revenue, top sellers, and category mix computed live from your orders.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

function Landing() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Features />
      <LivePreview />
      <TechStack />
      <FinalCta />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative px-5 pt-20 pb-16 sm:pt-28">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-60 blur-[130px]"
        style={{ background: "var(--accent-soft)" }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.span
          {...fadeUp}
          className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--accent-text)",
          }}
        >
          <Zap size={13} />
          Restaurant order management, end to end
        </motion.span>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
        >
          Run the floor,
          <br />
          <span style={{ color: "var(--accent)" }}>not the paperwork.</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-lg"
          style={{ color: "var(--text-muted)" }}
        >
          ServeFlow is a restaurant point-of-sale — take orders, track them live,
          and settle payments. A React front end on a C++ API.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/dashboard"
            className="group flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--accent)" }}
          >
            Open dashboard
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            to="/order"
            className="rounded-xl border px-6 py-3 font-semibold transition-colors"
            style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
          >
            Take an order
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border p-6"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                <f.icon size={21} />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LivePreview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((o) => setOrders(o.slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <motion.div {...fadeUp} className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Live from the kitchen</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            A real snapshot of the orders board.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl"
                  style={{ background: "var(--surface-2)" }}
                />
              ))
            : orders.map((o, i) => {
                const st = statusStyle(o.status);
                return (
                  <motion.div
                    key={o.orderId}
                    {...fadeUp}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="rounded-2xl border p-4"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                        style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}
                      >
                        {initials(o.customer.name)}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold">{o.customer.name}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>
                      {itemsSummary(o)}
                    </p>
                    <p className="tnum mt-3 text-sm font-bold">{formatINR(o.total)}</p>
                  </motion.div>
                );
              })}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--accent-text)" }}
          >
            Open the full dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  const stack = ["React", "TypeScript", "Vite", "Tailwind CSS", "C++ · Crow", "REST API"];
  return (
    <section className="px-5 py-16">
      <motion.div
        {...fadeUp}
        className="mx-auto max-w-3xl rounded-2xl border p-8 text-center"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2 className="text-2xl font-bold tracking-tight">Built to be real</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm" style={{ color: "var(--text-muted)" }}>
          A typed React front end talking to a C++ REST API — with a demo mode so
          it stays live even when the server is offline.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded-full border px-3.5 py-1.5 text-sm font-medium"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
                color: "var(--text-muted)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
        <p
          className="mt-6 inline-flex items-center gap-1.5 text-xs"
          style={{ color: "var(--text-faint)" }}
        >
          <WifiOff size={13} /> Works offline with bundled demo data
        </p>
      </motion.div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 pb-8 pt-6">
      <motion.div
        {...fadeUp}
        className="mx-auto max-w-3xl rounded-3xl p-10 text-center"
        style={{ background: "var(--accent)" }}
      >
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          See it in action
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
          Jump straight into the service dashboard and take your first order.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold transition-transform hover:-translate-y-0.5"
          style={{ color: "var(--accent-text)" }}
        >
          Open dashboard <ArrowRight size={17} />
        </Link>
      </motion.div>
    </section>
  );
}

export default Landing;
