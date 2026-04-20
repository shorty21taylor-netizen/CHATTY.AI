import { auth, currentUser } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardShell from './dashboard-shell';
import { getBillingStatus } from '@/lib/stripe/billing-gate';
import { isAdmin } from '@/lib/admin';

// Server layout: gates the entire /dashboard/* tree on an active Stripe
// subscription. Clerk middleware (Edge runtime) can't talk to Postgres, so
// the check has to run here where we have Node + Drizzle. The client shell
// (sidebar, nav, mobile drawer, etc.) lives in dashboard-shell.jsx.
export default async function DashboardLayout({ children }) {
  const { orgId } = await auth();
  if (!orgId) {
    redirect('/sign-in');
  }

  // Admin bypass — Anthony + any future teammates on the ADMIN_EMAILS list
  // always get in, even before Stripe is wired for their org.
  let email = null;
  try {
    const user = await currentUser();
    email = user?.primaryEmailAddress?.emailAddress || null;
  } catch {
    // If Clerk lookup fails, fall through to the Stripe check.
  }
  if (isAdmin(email)) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  // Allow /dashboard/billing through even when inactive so an unpaid user
  // can reach the billing page and pay without being bounced to /pricing.
  const hdrs = await headers();
  const pathname = hdrs.get('x-pathname') || '';
  const isBillingRoute = pathname.startsWith('/dashboard/billing');

  // Check Stripe subscription via Drizzle (Node runtime — safe here).
  let isActive = false;
  try {
    const billing = await getBillingStatus(orgId);
    isActive = billing.isActive;
  } catch (err) {
    console.error('[dashboard-gate] getBillingStatus failed', err);
    return <DashboardShell>{children}</DashboardShell>;
  }

  if (!isActive && !isBillingRoute) {
    redirect('/pricing?reason=inactive');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
