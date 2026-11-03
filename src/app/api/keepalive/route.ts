export const dynamic = "force-dynamic";

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return Response.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
    status,
  });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return jsonResponse({ ok: false, message: "Unauthorized keepalive request" }, 401);
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        ok: false,
        message: "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      },
      500
    );
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/companies?select=id&limit=1`;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: "Supabase keepalive request failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      502
    );
  }

  if (!response.ok) {
    return jsonResponse(
      {
        ok: false,
        message: "Supabase keepalive query failed",
        status: response.status,
      },
      502
    );
  }

  return jsonResponse({
    ok: true,
    checked_at: new Date().toISOString(),
  });
}
