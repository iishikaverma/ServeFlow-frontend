import { NavLink, Link } from "react-router-dom";
import { Moon, Sun, UtensilsCrossed, Plus } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analytics", label: "Analytics" },
];

function Navbar() {
  const { theme, toggle } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--bg) 82%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <UtensilsCrossed size={19} />
          </span>
          <span className="text-lg font-bold tracking-tight">ServeFlow</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={({ isActive }) => ({
                color: isActive ? "var(--accent-text)" : "var(--text-muted)",
                background: isActive ? "var(--accent-soft)" : "transparent",
              })}
            >
              {l.label}
            </NavLink>
          ))}

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <Link
            to="/order"
            className="ml-1 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New order</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
