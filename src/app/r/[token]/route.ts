import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token || token.length > 20) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const result = await query<{ id: string; destination_url: string }>(
    `UPDATE review_request_links
     SET clicks_count = clicks_count + 1,
         first_clicked_at = COALESCE(first_clicked_at, NOW())
     WHERE token = $1
     RETURNING id, destination_url`,
    [token],
  );

  const row = result.rows[0];
  if (!row) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.redirect(row.destination_url, 302);
}
