import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Lightweight stubs for routes built in later phases.
function Stub({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-md px-5 py-28 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2" style={{ color: "var(--text-muted)" }}>
        Coming in the next build phase.
      </p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/order" element={<Stub title="New order" />} />
        <Route path="/order/:id/pay" element={<Stub title="Payment" />} />
        <Route path="/analytics" element={<Stub title="Analytics" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
