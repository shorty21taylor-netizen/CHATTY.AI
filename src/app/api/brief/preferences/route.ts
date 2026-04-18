import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { briefPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db
    .select()
    .from(briefPreferences)
    .where(eq(briefPreferences.orgId, orgId))
    .limit(1);

  return NextResponse.json({
    preferences: row || {
      enabled: true,
      deliveryTime: "06:00",
      timezone: "America/New_York",
      smsEnabled: true,
      voiceEnabled: true,
      emailEnabled: false,
      phoneNumber: null,
      emailAddress: null,
      voiceId: null,
    },
  });
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phoneNumber = body.phone_number as string | null;
  if (phoneNumber && !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
    return NextResponse.json(
      { error: "phone_number must be E.164 format (e.g. +15551234567)" },
      { status: 400 },
    );
  }

  const emailAddress = body.email_address as string | null;
  if (emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
    return NextResponse.json(
      { error: "email_address must be a valid email" },
      { status: 400 },
    );
  }

  const values = {
    orgId,
    enabled: body.enabled !== false,
    deliveryTime: (body.delivery_time as string) || "06:00",
    timezone: (body.timezone as string) || "America/New_York",
    smsEnabled: body.sms_enabled !== false,
    voiceEnabled: body.voice_enabled !== false,
    emailEnabled: body.email_enabled === true,
    phoneNumber: phoneNumber || null,
    emailAddress: emailAddress || null,
    voiceId: (body.voice_id as string) || null,
    updatedAt: new Date(),
  };

  const [row] = await db
    .insert(briefPreferences)
    .values(values)
    .onConflictDoUpdate({
      target: briefPreferences.orgId,
      set: {
        enabled: values.enabled,
        deliveryTime: values.deliveryTime,
        timezone: values.timezone,
        smsEnabled: values.smsEnabled,
        voiceEnabled: values.voiceEnabled,
        emailEnabled: values.emailEnabled,
        phoneNumber: values.phoneNumber,
        emailAddress: values.emailAddress,
        voiceId: values.voiceId,
        updatedAt: values.updatedAt,
      },
    })
    .returning();

  return NextResponse.json({ preferences: row });
}
