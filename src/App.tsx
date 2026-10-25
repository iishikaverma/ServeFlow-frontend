import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import NewOrder from "./pages/NewOrder";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

// Code-split the charts (recharts is heavy) so it loads only on /analytics.
const Analytics = lazy(() => import("./pages/Analytics"));

function RouteFallback() {
  return (
    <div className="px-5 py-28 text-center text-sm" style={{ color: "var(--text-muted)" }}>
      Loading…
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/order" element={<NewOrder />} />
        <Route path="/order/:id/pay" element={<Payment />} />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Analytics />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
