import { WifiOff } from "lucide-react";
import { useDataMode } from "../hooks/useDataMode";

function DataModeBanner() {
  const mode = useDataMode();
  if (mode !== "mock") return null;

  return (
    <div
      className="border-b text-center text-sm"
      style={{
        background: "var(--warning-soft)",
        borderColor: "var(--border)",
        color: "var(--warning)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-5 py-2">
        <WifiOff size={15} />
        <span>
          Demo mode — API offline. Showing bundled sample data.
        </span>
      </div>
    </div>
  );
}

export default DataModeBanner;
