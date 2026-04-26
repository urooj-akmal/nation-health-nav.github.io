import { Activity } from "lucide-react";
import { useApp } from "@/lib/store";

export function Header() {
  const { mode, setMode } = useApp();

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur flex items-center justify-between px-5 z-30 relative">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <h1 className="font-display font-bold text-[15px] tracking-tight">
            Serving a Nation
          </h1>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
            Agentic Healthcare Intelligence · India
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center bg-surface-2 border border-border rounded-md p-0.5">
          <button
            onClick={() => setMode("citizen")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === "citizen"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => setMode("admin")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === "admin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Admin
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-trust-green status-dot shadow-[0_0_8px_var(--trust-green)]" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
            API Online
          </span>
        </div>
      </div>
    </header>
  );
}
