import { useState } from "react";
import { X, Navigation, MapPin, ShieldCheck, AlertTriangle, Globe } from "lucide-react";
import { useApp } from "@/lib/store";
import { trustLevel, trustColor, type FacilityResult } from "@/lib/types";

function ArcGauge({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(10, value)) / 10;
  const r = 42;
  const c = Math.PI * r;
  return (
    <div className="relative w-28 h-16">
      <svg viewBox="0 0 100 56" className="w-full h-full">
        <path
          d={`M 8 50 A ${r} ${r} 0 0 1 92 50`}
          fill="none"
          stroke="#243028"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d={`M 8 50 A ${r} ${r} 0 0 1 92 50`}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.6s" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <div className="text-2xl font-display font-bold leading-none" style={{ color }}>
          {value}
        </div>
        <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
          Trust
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {value}/10
        </span>
      </div>
      <div className="h-2 bg-background rounded overflow-hidden">
        <div
          className="h-full rounded transition-all"
          style={{ width: `${value * 10}%`, background: color }}
        />
      </div>
    </div>
  );
}

function VerificationTab({ f }: { f: FacilityResult }) {
  const level = trustLevel(f);
  const color = trustColor(level);

  return (
    <div className="space-y-5">
      {/* Agent 1 findings */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-2">
          Agent 1 Findings
        </div>
        <div className="bg-surface-2 border border-border rounded-md p-3">
          <div className="flex items-start gap-3 mb-3">
            <ArcGauge value={f.agent1_score} color={color} />
            <div className="flex-1 space-y-1.5 text-[11px]">
              <div>
                <span className="text-muted-foreground font-mono">Specialty:</span>{" "}
                <span>{f.specialty_services ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-mono">Equipment:</span>{" "}
                <span>{f.equipment_status ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-mono">Staffing:</span>{" "}
                <span>{f.staffing_levels ?? "—"}</span>
              </div>
            </div>
          </div>
          {f.truth_gap_notes && (
            <div className="border-l-2 border-trust-amber bg-trust-amber/5 pl-3 py-2 mt-3">
              <div className="text-[10px] uppercase font-mono tracking-wider text-trust-amber mb-1">
                Truth Gaps Found
              </div>
              <div className="font-mono text-[11px] leading-relaxed text-foreground/85">
                {f.truth_gap_notes}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Evidence */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-2">
          AI Evidence Trail
        </div>
        <div className="space-y-1.5">
          {f.evidence_citations.map((c, i) => (
            <div
              key={i}
              className="bg-surface-2 border border-border rounded p-2.5 font-mono text-[11px] leading-relaxed text-foreground/85"
            >
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* Validator review */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-2">
          Validator Agent Review
        </div>
        <div className="bg-surface-2 border border-border rounded-md p-3 space-y-3">
          <div className="flex gap-4">
            <ScoreBar label="Agent 1" value={f.agent1_score} color="#185FA5" />
            <ScoreBar label="Validator" value={f.validator_score} color="#1D9E75" />
          </div>
          {f.corrections && (
            <div className="border-l-2 border-trust-red bg-trust-red/5 pl-3 py-2">
              <div className="text-[10px] uppercase font-mono tracking-wider text-trust-red mb-1">
                Corrections
              </div>
              <div className="text-[11px] leading-relaxed">{f.corrections}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <div className="text-muted-foreground font-mono text-[10px] uppercase mb-0.5">
                Confidence
              </div>
              <div>{f.confidence_note}</div>
            </div>
            <div>
              <div className="text-muted-foreground font-mono text-[10px] uppercase mb-0.5">
                Query Match
              </div>
              <div>{f.query_match_notes}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Consistency */}
      {f.consistency_flag && (
        <section>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-2">
            Consistency Check · Re-audit Result
          </div>
          <div className="bg-trust-amber/10 border border-trust-amber/40 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-trust-amber shrink-0 mt-0.5" />
              <div className="text-[12px] font-mono text-trust-amber leading-relaxed">
                {f.consistency_flag}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Verified capabilities */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-2">
          Verified Capabilities ({f.verified_capability_count})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {f.verified_capabilities.map((cap) => (
            <span
              key={cap}
              className="bg-trust-green/15 border border-trust-green/40 text-trust-green text-[11px] font-medium px-2 py-1 rounded-full"
            >
              ✓ {cap}
            </span>
          ))}
        </div>
      </section>

      {/* Medical desert */}
      {f.is_medical_desert && f.desert_reason && (
        <section>
          <div className="bg-trust-red/15 border border-trust-red/50 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-trust-red" />
              <div className="text-[11px] uppercase tracking-wider font-mono font-bold text-trust-red">
                Medical Desert Detected
              </div>
            </div>
            <div className="text-[12px] leading-relaxed text-foreground/90">
              {f.desert_reason}
            </div>
          </div>
        </section>
      )}

      {/* Web search fallback */}
      {f.web_search_answer && (
        <section>
          <div className="bg-trust-amber/10 border border-trust-amber/40 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-trust-amber" />
              <div className="text-[11px] uppercase font-mono tracking-wider text-trust-amber">
                No Facility in Dataset · General Guidance
              </div>
            </div>
            <div className="text-[12px] leading-relaxed">{f.web_search_answer}</div>
          </div>
        </section>
      )}
    </div>
  );
}

function NavigateTab({ f }: { f: FacilityResult }) {
  const url = f.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${f.coordinates.lat},${f.coordinates.long}`
    : "#";
  return (
    <div className="space-y-4">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md py-3 text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_0_24px_-6px_var(--primary)]"
      >
        <Navigation className="w-4 h-4" />
        Navigate Now
      </a>

      <div className="grid grid-cols-2 gap-3 text-[12px]">
        <div className="bg-surface-2 border border-border rounded-md p-3">
          <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground mb-1">
            Coordinates
          </div>
          <div className="font-mono">
            {f.coordinates ? `${f.coordinates.lat.toFixed(4)}, ${f.coordinates.long.toFixed(4)}` : "—"}
          </div>
        </div>
        <div className="bg-surface-2 border border-border rounded-md p-3">
          <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground mb-1">
            PIN Code
          </div>
          <div className="font-mono">{f.pin_code ?? "—"}</div>
        </div>
      </div>

      <div className="bg-surface-2 border border-border rounded-md p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
            Crisis Score
          </div>
          <div className="text-xl font-display font-bold" style={{ color: trustColor(trustLevel(f)) }}>
            {f.crisis_score.toFixed(1)}
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">lower = better</div>
      </div>
    </div>
  );
}

export function TruthBox() {
  const { results, selectedId, selectFacility } = useApp();
  const [tab, setTab] = useState<"verify" | "nav">("verify");
  const f = results.find((r) => r.facility_id === selectedId);

  if (!f) return null;
  const level = trustLevel(f);
  const color = trustColor(level);

  return (
    <div className="absolute top-0 right-0 h-full w-[420px] bg-surface border-l border-border shadow-2xl z-[1100] animate-slide-in-right flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="font-display font-bold text-lg leading-tight">{f.facility_name}</h2>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-1">
              <MapPin className="w-3 h-3" />
              {f.city}, {f.state} · PIN {f.pin_code}
            </div>
          </div>
          <button
            onClick={() => selectFacility(null)}
            className="text-muted-foreground hover:text-foreground p-1 -mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${color}25`, color, border: `1px solid ${color}60` }}
          >
            {f.trust_score} / 10
          </span>
          <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-2 py-0.5">
            CI: {f.interval_label}
          </span>
          {f.validated ? (
            <span className="text-[10px] bg-trust-green/15 border border-trust-green/40 text-trust-green px-2 py-0.5 rounded font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Validated
            </span>
          ) : (
            <span className="text-[10px] bg-trust-amber/15 border border-trust-amber/40 text-trust-amber px-2 py-0.5 rounded font-medium">
              ⚠ Corrections made
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground mt-2">{f.uncertainty}</div>
      </div>

      <div className="flex border-b border-border">
        {(["verify", "nav"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[12px] uppercase font-mono tracking-wider transition-colors ${
              tab === t
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "verify" ? "Verification" : "Navigate"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "verify" ? <VerificationTab f={f} /> : <NavigateTab f={f} />}
      </div>
    </div>
  );
}
