// Healthcheck del frontend (para uptime monitors)
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    ok: true,
    service: "quipu-frontend",
    timestamp: new Date().toISOString(),
  });
}
