import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, Polyline } from "react-leaflet";
import { useApp } from "@/lib/store";
import { trustLevel, trustColor } from "@/lib/types";
import { Flame } from "lucide-react";

const USER_LOC: [number, number] = [28.6139, 77.2090]; // Delhi default

function FlyController() {
  const map = useMap();
  const flyTo = useApp((s) => s.flyToCoord);
  useEffect(() => {
    if (flyTo) map.flyTo([flyTo.lat, flyTo.long], 8, { duration: 1.2 });
  }, [flyTo, map]);
  return null;
}

function HeatLayer() {
  const map = useMap();
  const { results, showHeatmap } = useApp();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!showHeatmap) return;
    const points = results
      .filter((r) => r.coordinates)
      .map((r) => [r.coordinates!.lat, r.coordinates!.long, r.crisis_score / 10] as [number, number, number]);
    if (points.length === 0) return;
    // @ts-expect-error leaflet.heat types
    const heat = L.heatLayer(points, {
      radius: 60,
      blur: 40,
      maxZoom: 10,
      gradient: { 0.2: "#1D9E75", 0.5: "#EF9F27", 0.8: "#E24B4A", 1.0: "#ff2020" },
    });
    heat.addTo(map);
    layerRef.current = heat;
    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [showHeatmap, results, map]);

  return null;
}

export function MapView() {
  const { results, selectedId, selectFacility, setFlyTo, mode, showHeatmap, toggleHeatmap } = useApp();
  const selected = results.find((r) => r.facility_id === selectedId);

  return (
    <div className="relative flex-1 h-full">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FlyController />
        <HeatLayer />

        {/* User location */}
        <CircleMarker
          center={USER_LOC}
          radius={8}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.9, weight: 2 }}
        >
          <Tooltip>Your location (New Delhi)</Tooltip>
        </CircleMarker>
        <CircleMarker
          center={USER_LOC}
          radius={16}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 0 }}
        />

        {/* Facility pins */}
        {results.map((f) => {
          if (!f.coordinates) return null;
          const level = trustLevel(f);
          const color = trustColor(level);
          const isSel = f.facility_id === selectedId;
          return (
            <CircleMarker
              key={f.facility_id}
              center={[f.coordinates.lat, f.coordinates.long]}
              radius={isSel ? 12 : 9}
              pathOptions={{
                color: "#fff",
                weight: 2,
                fillColor: color,
                fillOpacity: 0.95,
              }}
              eventHandlers={{
                click: () => {
                  selectFacility(f.facility_id);
                  setFlyTo(f.coordinates!);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <div className="text-xs">
                  <div className="font-medium">{f.facility_name}</div>
                  <div className="font-mono" style={{ color }}>
                    Trust {f.trust_score}/10
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Route to selected green pin */}
        {selected && trustLevel(selected) === "green" && selected.coordinates && (
          <Polyline
            positions={[USER_LOC, [selected.coordinates.lat, selected.coordinates.long]]}
            pathOptions={{ color: "#1D9E75", weight: 2, dashArray: "6 8", opacity: 0.7 }}
          />
        )}
      </MapContainer>

      {/* Admin heatmap toggle */}
      {mode === "admin" && results.length > 0 && (
        <button
          onClick={toggleHeatmap}
          className={`absolute top-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-colors ${
            showHeatmap
              ? "bg-trust-red/20 border-trust-red text-trust-red"
              : "bg-surface/90 border-border text-foreground hover:bg-surface-2"
          } backdrop-blur`}
        >
          <Flame className="w-3.5 h-3.5" />
          Desert Heatmap {showHeatmap ? "ON" : "OFF"}
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-surface/90 backdrop-blur border border-border rounded-md p-3 space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
          Trust Legend
        </div>
        {[
          { c: "#1D9E75", l: "Validated · Trust > 7" },
          { c: "#EF9F27", l: "Trust 4 – 7" },
          { c: "#E24B4A", l: "Trust ≤ 3 / Desert" },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-2 text-[11px]">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/80"
              style={{ background: x.c }}
            />
            <span className="text-muted-foreground">{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
