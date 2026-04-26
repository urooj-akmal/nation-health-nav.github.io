import { create } from "zustand";
import type { FacilityResult } from "@/lib/types";

interface AppState {
  mode: "citizen" | "admin";
  setMode: (m: "citizen" | "admin") => void;

  results: FacilityResult[];
  setResults: (r: FacilityResult[]) => void;

  selectedId: string | null;
  selectFacility: (id: string | null) => void;

  loading: boolean;
  loadingStep: number;
  setLoading: (l: boolean) => void;
  setLoadingStep: (s: number) => void;

  lastLatencyMs: number | null;
  setLastLatency: (n: number | null) => void;

  showHeatmap: boolean;
  toggleHeatmap: () => void;

  drawerOpen: boolean;
  setDrawerOpen: (b: boolean) => void;

  flyToCoord: { lat: number; long: number } | null;
  setFlyTo: (c: { lat: number; long: number } | null) => void;
}

export const useApp = create<AppState>((set) => ({
  mode: "citizen",
  setMode: (mode) => set({ mode, drawerOpen: mode === "admin" }),

  results: [],
  setResults: (results) => set({ results }),

  selectedId: null,
  selectFacility: (selectedId) => set({ selectedId }),

  loading: false,
  loadingStep: 0,
  setLoading: (loading) => set({ loading }),
  setLoadingStep: (loadingStep) => set({ loadingStep }),

  lastLatencyMs: null,
  setLastLatency: (lastLatencyMs) => set({ lastLatencyMs }),

  showHeatmap: false,
  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),

  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),

  flyToCoord: null,
  setFlyTo: (flyToCoord) => set({ flyToCoord }),
}));
