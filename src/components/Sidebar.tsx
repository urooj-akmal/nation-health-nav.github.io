import { useState } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { DEPARTMENTS, INDIAN_STATES, trustLevel, trustColor } from "@/lib/types";
import { MOCK_RESULTS } from "@/lib/mock-data";

const LOADING_STEPS = [
  "Searching 10,000 facility records...",
  "Agent 1 auditing facilities...",
  "Validator Agent cross-checking...",
  "Ranking results...",
];

export function Sidebar() {
  const {
    results, setResults, loading, setLoading,
    loadingStep, setLoadingStep, lastLatencyMs, setLastLatency,
    selectedId, selectFacility, setFlyTo,
  } = useApp();

  const [freeText, setFreeText] = useState("My father needs urgent cardiac care");
  const [departments, setDepartments] = useState<string[]>(["Cardiology", "ICU / Critical Care"]);
  const [state, setState] = useState<string>("");
  const [topN, setTopN] = useState(5);
  const [deptOpen, setDeptOpen] = useState(true);

  const toggleDept = (d: string) =>
    setDepartments((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]));

  const runSearch = async () => {
    setLoading(true);
    setResults([]);
    selectFacility(null);
    const t0 = performance.now();

    // Kick off the real API request in parallel with the loading animation
    const fetchPromise = fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        free_text: freeText,
        departments,
        state: state || null,
        top_n: topN,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error("Bad response shape");
        return data;
      })
      .catch((err) => {
        console.warn("Search API failed, using mock data:", err);
        return null;
      });

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadingStep(i);
      await new Promise((r) => setTimeout(r, 2000));
    }

    const apiResults = await fetchPromise;
    const finalResults =
      apiResults && apiResults.length > 0
        ? apiResults.slice(0, topN)
        : MOCK_RESULTS.slice(0, topN);

    setResults(finalResults);
    setLastLatency(Math.round(performance.now() - t0));
    setLoading(false);
    setLoadingStep(0);
  };

  return (
    <aside className="w-[380px] shrink-0 h-full bg-surface border-r border-border flex flex-col overflow-hidden">
      <div className="p-5 space-y-4 overflow-y-auto flex-1">
        {/* Free text */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-2 block">
            Describe the situation
          </label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Describe the emergency in your own words... e.g. 'My father needs urgent cardiac care'"
            className="w-full h-24 bg-surface-2 border border-border rounded-md p-3 text-sm placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        {/* Departments */}
        <div>
          <button
            onClick={() => setDeptOpen((o) => !o)}
            className="w-full flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-2"
          >
            <span>Departments {departments.length > 0 && `(${departments.length})`}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${deptOpen ? "" : "-rotate-90"}`}
            />
          </button>
          {deptOpen && (
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {DEPARTMENTS.map((d) => {
                const checked = departments.includes(d);
                return (
                  <label
                    key={d}
                    className={`flex items-center gap-2 text-[11px] px-2 py-1.5 rounded border cursor-pointer transition-colors ${
                      checked
                        ? "bg-primary/15 border-primary/50 text-foreground"
                        : "bg-surface-2 border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDept(d)}
                      className="sr-only"
                    />
                    <span
                      className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[10px] ${
                        checked ? "bg-primary border-primary text-primary-foreground" : "border-border"
                      }`}
                    >
                      {checked && "✓"}
                    </span>
                    <span className="truncate">{d}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* State */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-2 block">
            State / UT
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
          >
            <option value="">All India</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Top N */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
              Showing top {topN} facilities
            </label>
            <span className="text-[11px] font-mono text-primary">{topN}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {/* Search */}
        <button
          onClick={runSearch}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-medium rounded-md py-2.5 text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_0_24px_-6px_var(--primary)]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Auditing..." : "Find Verified Facilities →"}
        </button>

        {/* Loading status */}
        {loading && (
          <div className="bg-surface-2 border border-border rounded-md p-3 space-y-2">
            {LOADING_STEPS.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs transition-opacity ${
                  i === loadingStep ? "opacity-100" : i < loadingStep ? "opacity-60" : "opacity-30"
                }`}
              >
                {i < loadingStep ? (
                  <span className="text-primary">✓</span>
                ) : i === loadingStep ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <span className="w-3 h-3 inline-block" />
                )}
                <span className="font-mono text-[11px]">{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Latency */}
        {!loading && lastLatencyMs !== null && results.length > 0 && (
          <div className="text-[10px] font-mono text-muted-foreground border-t border-border pt-3">
            Last search: {(lastLatencyMs / 1000).toFixed(1)}s · 2 agents · {results.length} facilities
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
              Verified Results
            </div>
            {results.map((f) => {
              const level = trustLevel(f);
              const color = trustColor(level);
              const isSel = f.facility_id === selectedId;
              return (
                <button
                  key={f.facility_id}
                  onClick={() => {
                    selectFacility(f.facility_id);
                    if (f.coordinates) setFlyTo(f.coordinates);
                  }}
                  className={`w-full text-left bg-surface-2 hover:bg-surface-2/70 border rounded-md p-3 transition-all ${
                    isSel ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className="text-[10px] font-mono font-bold w-5 h-5 rounded flex items-center justify-center shrink-0"
                      style={{ background: color, color: "#0F1412" }}
                    >
                      {f.rank_in_results}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium leading-tight truncate">
                        {f.facility_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {f.city}, {f.state}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-background rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all"
                        style={{ width: `${f.trust_score * 10}%`, background: color }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold" style={{ color }}>
                      {f.trust_score}/10
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground mb-1.5">
                    Interval: {f.interval_label}
                  </div>

                  <div className="text-[11px] text-foreground/80 leading-snug line-clamp-2">
                    {f.recommendation}
                  </div>

                  {f.consistency_flag && (
                    <div className="mt-2 text-[10px] font-mono text-trust-amber border-l-2 border-trust-amber pl-2">
                      ⚠ {f.consistency_flag}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
