import { UtensilsCrossed } from "lucide-react";

function Footer() {
  return (
    <footer
      className="mt-20 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm sm:flex-row">
        <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
          <UtensilsCrossed size={16} style={{ color: "var(--accent)" }} />
          <span>ServeFlow — restaurant order management</span>
        </div>
        <p style={{ color: "var(--text-faint)" }}>
          React · TypeScript · C++ (Crow) API
        </p>
      </div>
    </footer>
  );
}

export default Footer;
