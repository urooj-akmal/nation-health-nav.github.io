import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MapView } from "@/components/MapView";
import { TruthBox } from "@/components/TruthBox";
import { AdminDrawer } from "@/components/AdminDrawer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serving a Nation — Agentic Healthcare Intelligence for India" },
      {
        name: "description",
        content:
          "AI-audited healthcare facility finder for India. Two-agent verification surfaces trust gaps, medical deserts, and supply chain failures across 10,000+ facilities.",
      },
      { property: "og:title", content: "Serving a Nation — Agentic Healthcare Intelligence" },
      {
        property: "og:description",
        content:
          "Find verified facilities. Expose medical deserts. Two AI agents cross-check every claim.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <MapView />
          <TruthBox />
          <AdminDrawer />
        </div>
      </div>
    </div>
  );
}
