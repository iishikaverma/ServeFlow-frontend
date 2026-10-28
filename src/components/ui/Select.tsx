import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

// A themed dropdown that matches the app's design in both light and dark modes.
// Native <select> option lists are OS-drawn and can't be styled, so this
// replaces them with a custom popup.
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  block = false,
  menuAlign = "left",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  ariaLabel?: string;
  className?: string;
  block?: boolean;
  menuAlign?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className={`relative ${block ? "" : "inline-block"} ${className ?? ""}`}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`flex items-center justify-between gap-2 rounded-[10px] border px-3 py-2.5 text-[13px] transition-colors ${
          block ? "w-full" : "min-w-[8rem]"
        }`}
        style={{
          borderColor: open ? "var(--accent)" : "var(--border-strong)",
          background: "var(--surface-2)",
          color: "var(--text)",
          boxShadow: open ? "0 0 0 3px var(--ring)" : "none",
        }}
      >
        <span className="truncate">{current?.label ?? value}</span>
        <ChevronDown
          size={15}
          style={{ color: "var(--text-faint)" }}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute z-20 mt-1 max-h-60 min-w-full overflow-auto rounded-xl border p-1 ${
            menuAlign === "right" ? "right-0" : "left-0"
          }`}
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(o.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[13px] transition-colors"
                style={{
                  background: selected ? "var(--accent-soft)" : "transparent",
                  color: selected ? "var(--accent-text)" : "var(--text)",
                }}
                onMouseEnter={(e) => {
                  if (!selected)
                    e.currentTarget.style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  if (!selected)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{o.label}</span>
                {selected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
