import { useEffect, useState } from "react";
import { getMenu, getDataMode, subscribeDataMode, type DataMode } from "./services/api";
import type { MenuItem } from "./services/types";

function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DataMode>(getDataMode());

  useEffect(() => {
    const unsub = subscribeDataMode(setMode);
    getMenu()
      .then(setMenu)
      .finally(() => setLoading(false));
    return unsub;
  }, []);

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl">
        {mode === "mock" && (
          <div
            className="mb-8 rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "var(--warning-soft)",
              borderColor: "var(--border)",
              color: "var(--warning)",
            }}
          >
            Demo data — API offline. Showing bundled sample menu.
          </div>
        )}

        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          ServeFlow · setup complete
        </span>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
          Restaurant order management,
          <br />
          <span style={{ color: "var(--accent)" }}>done right.</span>
        </h1>

        <p className="mt-3 text-lg" style={{ color: "var(--text-muted)" }}>
          Phase 1 scaffold is live — theme, fonts, and the data layer are wired.
        </p>

        <div
          className="mt-10 rounded-2xl border p-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            Menu ({loading ? "…" : menu.length} items)
          </h2>
          <ul className="mt-4 space-y-2">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-12 animate-pulse rounded-lg"
                    style={{ background: "var(--surface-2)" }}
                  />
                ))
              : menu.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                        {item.category}
                      </p>
                    </div>
                    <span className="tnum font-semibold" style={{ color: "var(--accent-text)" }}>
                      ₹{item.price}
                    </span>
                  </li>
                ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
