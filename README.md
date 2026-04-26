# QuantumHealth — Agentic Healthcare Maps for India

> Multi-agent healthcare intelligence system over 10,000 messy Indian facility records. Trust-scored, sentence-cited, geospatially aware. Built on the Databricks Data Intelligence Platform for Hack-Nation 5 — *Serving A Nation* challenge.

🔗 **Live demo:** https://qhealthtest.lovable.app

![demo placeholder](docs/demo.gif)

## The Problem

In rural India, "static" healthcare data is unreliable. A facility might be listed as having an ICU but actually lack functioning equipment or 24/7 staffing. During the Golden Hour, this data gap costs lives. Existing tools surface raw lists; what's missing is **verified, trust-scored, agentic recommendations** with reasoning a human can audit.

## Our Approach — Three Pillars

### Pillar 1 — Data & Retrieval Layer
- 10,000 messy Excel rows → cleaned Delta Lake table in Unity Catalog
- Mosaic AI Vector Search with HNSW index on 1,024-dim GTE-Large embeddings
- `retrieve_for_agent(query, k, filters)` returns Data Contract JSON in ~1.5s

### Pillar 2 — Agentic Reasoning
- **Auditor Agent** (Llama-3.3-70B): extracts trust score, Truth Gaps, verified capabilities — with mandatory sentence-level citations
- **Validator Agent** (Llama-3.3-70B): independently reviews Auditor's output, applies medical-standard rules, flags hallucinations
- **Conservative ensemble:** final trust = `min(auditor, validator)` + statistical confidence interval
- **Parallel execution:** per-facility audits run via `ThreadPoolExecutor` to stay under the SRS 10s budget

### Pillar 3 — Crisis Command Center
- React frontend deployed on Lovable
- Leaflet + CartoDB Dark Matter tiles for the geospatial view
- Google Maps integration for turn-by-turn navigation
- Trust-graded pins (green/yellow/red) with severity-calibrated recommendations
- Slide-out "Truth Box" with sentence-cited reasoning trace
- Admin Mode: Desert Heatmap, Self-Correction Delta chart, Critical Supply Chain Needs

## Architecture

```
Excel (10k rows)
    │
    ▼
[Pillar 1] Delta Lake → Mosaic AI Vector Search Index
    │
    │  retrieve_for_agent(query, k, filters)
    ▼
[Pillar 2] Lead Auditor (Llama 3.3-70B)
              │
              ▼
           Validator (Skeptic)
              │
              ▼
   {trust_score, truth_gap_notes, verified_capabilities,
    evidence_citations, confidence_interval, ...}
    │
    │  Databricks Model Serving REST endpoint
    ▼
[Pillar 3] React + Leaflet/CartoDB + Google Maps
   - Citizen Mode: trust-graded pins, Truth Box, Navigate
   - Admin Mode: Desert Heatmap, Self-Correction Delta,
                 Critical Supply Chain Needs
```

## Data Contract

Every result returned by `lead_auditor_agent()` conforms to:

```json
{
  "facility_id": "string",
  "facility_name": "string",
  "pin_code": 800020,
  "state": "Bihar",
  "city": "Patna",
  "coordinates": { "lat": 25.61, "long": 85.13 },
  "trust_score": 8,
  "verified_capabilities": ["NICU", "24/7 Emergency"],
  "truth_gap_notes": "[S2] claims Advanced Cardiac Care but [S4] lists no anesthesiologist.",
  "evidence_citations": ["[S1] 24/7 emergency care confirmed."],
  "is_medical_desert": false,
  "interval_label": "8.0 – 9.0 / 10",
  "confidence_note": "High — both agents aligned on evidence",
  "recommendation": "Best match — go here first",
  "agent1_score": 8,
  "validator_score": 9,
  "latency_ms": 5430
}
```

## How to Run

### Pillar 1 + 2 — Databricks Notebook

1. Open `02_retrieval_layer.ipynb` in your Databricks workspace
2. Update the email path at the top: `mlflow.set_experiment("/Users/<your-email>/serving-a-nation")`
3. Upload the cleaned Parquet to a Unity Catalog Volume, then run the cells in order:
   - Cells 1–5: install deps + create Delta table + vector endpoint + index
   - Pillar 2 cells: define `lead_auditor_agent()` + `validator_agent()`
4. Deploy `lead_auditor_agent` as a Databricks Model Serving endpoint

### Pillar 3 — Frontend

```bash
cd src/
npm install
npm run dev
```

Set in your `.env`:
```
VITE_AGENT_ENDPOINT=https://<workspace>.cloud.databricks.com/serving-endpoints/<endpoint>/invocations
VITE_DATABRICKS_TOKEN=<scoped PAT — model-serving + mlflow + vector-search scopes>
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-key>
```

## Tech Stack

| Layer | Technology |
|---|---|
| Data | Delta Lake, Unity Catalog, Change Data Feed |
| Retrieval | Mosaic AI Vector Search, HNSW, GTE-Large embeddings |
| Agents | Llama-3.3-70B via Databricks Foundation Model APIs |
| Observability | MLflow 3 Tracing |
| Backend serving | Databricks Model Serving |
| Frontend | React, Vite, Leaflet, CartoDB tiles, Google Maps API |
| Deployment | Lovable |

## Team

- **Ami** — Data pipeline & retrieval (Pillar 1)
- **Urooj** — Agentic reasoning engine (Pillar 2)
- **Amaan** — Crisis Command Center UI (Pillar 3)

Built for **Hack-Nation 5** × MIT Club of Northern California × MIT Club of Germany — *Serving A Nation* challenge powered by Databricks.
