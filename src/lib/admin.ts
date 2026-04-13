/**
 * Admin Session Helpers
 *
 * Manages admin authentication state for the dashboard.
 * Uses Clerk for auth, with a cookie-based bypass for demo/admin access.
 */

import { cookies } from "next/headers";

const ADMIN_SESSION_KEY = "chatty_admin_session";

export interface AdminSession {
  orgId: string;
  orgName: string;
  userId: string;
  email: string;
  role: "owner" | "admin" | "manager" | "operator";
  isAdmin: boolean;
}

/**
 * Get the current admin session from cookies.
 * Returns null if no valid session exists.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_SESSION_KEY);

    if (!sessionCookie?.value) {
      // Return demo session for development
      if (process.env.NODE_ENV === "development" || process.env.DEMO_MODE === "true") {
        return getDemoSession();
      }
      return null;
    }

    return JSON.parse(sessionCookie.value) as AdminSession;
  } catch {
    return null;
  }
}

/**
 * Set admin session (called after Clerk auth or admin bypass).
 */
export async function setAdminSession(session: AdminSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_KEY, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

/**
 * Clear admin session (sign out).
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_KEY);
}

/**
 * Check if the current user has admin privileges.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

/**
 * Demo session for development and showcasing.
 */
function getDemoSession(): AdminSession {
  return {
    orgId: "org_demo_harbor_dental",
    orgName: "Harbor Dental",
    userId: "user_demo",
    email: "shorty21taylor@gmail.com",
    role: "owner",
    isAdmin: true,
  };
}
