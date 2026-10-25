import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-28 text-center">
      <UtensilsCrossed size={32} style={{ color: "var(--accent)" }} />
      <h1 className="mt-5 text-5xl font-extrabold tracking-tight">404</h1>
      <p className="mt-2" style={{ color: "var(--text-muted)" }}>
        This table isn't on the floor plan.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--accent)" }}
      >
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
