import { createFileRoute } from "@tanstack/react-router";

const DATABRICKS_URL =
  "https://dbc-d124dc19-00c2.cloud.databricks.com/serving-endpoints/serving-a-nation-endpoint/invocations";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { free_text, departments, state, top_n } = body ?? {};

          const token = process.env.DATABRICKS_TOKEN;
          if (!token) {
            return new Response(
              JSON.stringify({ error: "DATABRICKS_TOKEN not configured" }),
              {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          }

          const dbPayload = {
            dataframe_records: [
              {
                free_text: free_text ?? "",
                departments: JSON.stringify(departments ?? []),
                state: state || "",
                top_n: top_n ?? 5,
              },
            ],
          };

          const dbRes = await fetch(DATABRICKS_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dbPayload),
          });

          if (!dbRes.ok) {
            const text = await dbRes.text();
            console.error("Databricks error", dbRes.status, text);
            return new Response(
              JSON.stringify({
                error: `Databricks responded ${dbRes.status}`,
                detail: text,
              }),
              {
                status: 502,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          }

          const data = await dbRes.json();
          const rawResults = data?.predictions?.[0]?.results;
          if (!rawResults) {
            return new Response(
              JSON.stringify({ error: "Unexpected response shape", data }),
              {
                status: 502,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          }

          const results =
            typeof rawResults === "string" ? JSON.parse(rawResults) : rawResults;

          return new Response(JSON.stringify(results), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (error) {
          console.error("/api/search failed", error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            },
          );
        }
      },
    },
  },
});
