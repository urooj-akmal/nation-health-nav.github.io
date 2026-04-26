import { lazy, Suspense, useEffect, useState } from "react";

const MapView = lazy(() =>
  import("./MapView").then((m) => ({ default: m.MapView }))
);

export function MapViewLazy() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="flex-1 h-full bg-background" />;
  return (
    <Suspense fallback={<div className="flex-1 h-full bg-background" />}>
      <MapView />
    </Suspense>
  );
}
