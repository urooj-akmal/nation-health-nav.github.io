import { useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useApp } from "@/lib/store";

function Metric({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-surface-2 border border-border rounded-md px-3 py-2 min-w-[120px]">
      <div className="text-[9px] uppercase tracking-wider font-mono text-muted-foreground">
        {label}
      </div>
      <div
        className="text-xl font-display font-bold mt-0.5"
        style={{ color: color ?? "var(--foreground)" }}
      >
        {value}
      </div>
    </div>
  );
}

function parseSupplyNeeds(notes: string[]): { item: string; count: number }[] {
  const KEYWORDS = [
    "ventilator", "ventilators", "ICU bed", "ICU beds", "ambulance", "cath lab",
    "defibrillator", "oxygen", "ICU nurses", "intensivist", "cardiologist",
    "MRI", "CT scan", "blood bank",
  ];
  const counts = new Map<string, number>();
  notes.forEach((n) => {
    const lower = n.toLowerCase();
    KEYWORDS.forEach((k) => {
      if (lower.includes(k.toLowerCase())) {
        const norm = k.toLowerCase().replace(/s$/, "");
        counts.set(norm, (counts.get(norm) ?? 0) + 1);
      }
    });
  });
  return Array.from(counts.entries())
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function AdminDrawer() {
  const { mode, results, drawerOpen, setDrawerOpen } = useApp();

  const stats = useMemo(() => {
    const total = results.length;
    const validated = results.filter((r) => r.validated).length;
    const flagged = results.filter((r) => r.consistency_flag || !r.validated).length;
    const deserts = results.filter((r) => r.is_medical_desert).length;
    const avgTrust = total ? results.reduce((s, r) => s + r.trust_score, 0) / total : 0;
    return { total, validated, flagged, deserts, avgTrust };
  }, [results]);

  const chartData = results.map((r) => ({
    name: r.facility_name.length > 15 ? r.facility_name.slice(0, 15) + "…" : r.facility_name,
    Agent1: r.agent1_score,
    Validator: r.validator_score,
  }));

  const conf = useMemo(() => {
    let high = 0, med = 0, low = 0;
    results.forEach((r) => {
      const c = r.confidence_note.toLowerCase();
      if (c.includes("high")) high++;
      else if (c.includes("medium") || c.includes("moderate")) med++;
      else if (c.includes("low")) low++;
    });
    const total = high + med + low || 1;
    return { high, med, low, total };
  }, [results]);

  const supplyNeeds = useMemo(
    () => parseSupplyNeeds(results.map((r) => r.truth_gap_notes).filter(Boolean)),
    [results]
  );

  if (mode !== "admin") return null;

  const open = drawerOpen;

  return (
    <div
      className={`absolute left-0 right-0 bottom-0 z-[1050] bg-surface border-t border-border transition-all duration-300 ${
        open ? "h-[300px]" : "h-9"
      }`}
    >
      <button
        onClick={() => setDrawerOpen(!open)}
        className="absolute -top-px left-1/2 -translate-x-1/2 bg-surface border border-border border-b-0 rounded-t-md px-4 py-1 text-[11px] uppercase tracking-wider font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5"
      >
        Analytics {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {open && (
        <div className="h-full overflow-y-auto px-5 pt-4 pb-3">
          {results.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground font-mono">
              Run a search to populate admin analytics.
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Metrics column */}
              <div className="col-span-3 space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Audit Summary
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Audited" value={stats.total} />
                  <Metric label="Validated" value={stats.validated} color="#1D9E75" />
                  <Metric label="Flagged" value={stats.flagged} color="#EF9F27" />
                  <Metric label="Deserts" value={stats.deserts} color="#E24B4A" />
                </div>
                <Metric label="Avg Trust" value={stats.avgTrust.toFixed(1)} color="#1D9E75" />
              </div>

              {/* Chart column */}
              <div className="col-span-6 bg-surface-2 border border-border rounded-md p-3 flex flex-col">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Self-Correction Delta — Agent 1 vs Validator
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#243028" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#8A9490", fontSize: 10, fontFamily: "JetBrains Mono" }}
                        axisLine={{ stroke: "#2A3830" }}
                      />
                      <YAxis
                        domain={[0, 10]}
                        tick={{ fill: "#8A9490", fontSize: 10, fontFamily: "JetBrains Mono" }}
                        axisLine={{ stroke: "#2A3830" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#1A2420",
                          border: "1px solid #2A3830",
                          borderRadius: 6,
                          fontSize: 11,
                          fontFamily: "JetBrains Mono",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                      <Bar dataKey="Agent1" fill="#185FA5" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Validator" fill="#1D9E75" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right column: confidence + supply */}
              <div className="col-span-3 space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1.5">
                    Confidence Distribution
                  </div>
                  <div className="flex h-6 rounded overflow-hidden bg-surface-2 border border-border">
                    {conf.high > 0 && (
                      <div
                        className="bg-trust-green flex items-center justify-center text-[10px] font-mono font-bold text-background"
                        style={{ width: `${(conf.high / conf.total) * 100}%` }}
                      >
                        {conf.high}
                      </div>
                    )}
                    {conf.med > 0 && (
                      <div
                        className="bg-trust-amber flex items-center justify-center text-[10px] font-mono font-bold text-background"
                        style={{ width: `${(conf.med / conf.total) * 100}%` }}
                      >
                        {conf.med}
                      </div>
                    )}
                    {conf.low > 0 && (
                      <div
                        className="bg-trust-red flex items-center justify-center text-[10px] font-mono font-bold text-background"
                        style={{ width: `${(conf.low / conf.total) * 100}%` }}
                      >
                        {conf.low}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-1">
                    <span>High</span><span>Medium</span><span>Low</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1.5">
                    Critical Supply Chain Needs
                  </div>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto">
                    {supplyNeeds.length === 0 && (
                      <div className="text-[11px] text-muted-foreground font-mono">
                        No repeated gaps detected.
                      </div>
                    )}
                    {supplyNeeds.map((s) => (
                      <div
                        key={s.item}
                        className="flex items-center justify-between bg-surface-2 border border-border rounded px-2 py-1"
                      >
                        <span className="text-[11px] capitalize">{s.item}</span>
                        <span className="text-[10px] font-mono font-bold bg-trust-red/20 text-trust-red px-1.5 py-0.5 rounded">
                          {s.count}×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
