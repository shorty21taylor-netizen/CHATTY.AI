import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listVoices } from "@/lib/elevenlabs/client";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const voices = await listVoices();
    return NextResponse.json({ voices });
  } catch {
    return NextResponse.json({ voices: [] });
  }
}
