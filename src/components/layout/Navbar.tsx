import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Moon, Sun, UtensilsCrossed, Plus, Menu, X } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analytics", label: "Analytics" },
];

function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  const themeButton = (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
    >
      {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );

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

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 sm:flex">
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
          {themeButton}
          <Link
            to="/order"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={16} />
            New order
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1.5 sm:hidden">
          {themeButton}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {open && (
        <div
          className="border-t px-5 py-3 sm:hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        >
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                style={({ isActive }) => ({
                  color: isActive ? "var(--accent-text)" : "var(--text)",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                })}
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/order"
              className="mt-1 flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              <Plus size={16} />
              New order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
