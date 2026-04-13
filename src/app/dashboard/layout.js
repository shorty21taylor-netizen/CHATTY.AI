'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Zap,
  Bot,
  BarChart3,
  MessageSquare,
  Users,
  CalendarCheck,
  FileText,
  Settings,
  Plug,
  CreditCard,
  Rocket,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { getAdminSession, clearAdminSession } from '@/lib/admin';

// ---------------------------------------------------------------------------
// Navigation config
// ---------------------------------------------------------------------------

const MAIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/brief', label: 'Daily Brief', icon: Zap, pulse: true },
];

const NAV_GROUPS = [
  {
    id: 'operations',
    label: 'Operations',
    defaultOpen: true,
    items: [
      { href: '/dashboard/agents', label: 'Agents', icon: Bot },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    defaultOpen: true,
    items: [
      { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
      { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarCheck },
      { href: '/dashboard/proposals', label: 'Proposals', icon: FileText },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    defaultOpen: false,
    items: [
      { href: '/dashboard/admin', label: 'Admin', icon: Settings },
      { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
      { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    ],
  },
];

const COLLAPSED_WIDTH = 68;
const EXPANDED_WIDTH = 260;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setAdmin(getAdminSession());
  }, []);

  function handleSignOut() {
    clearAdminSession();
    setAdmin(null);
    router.push('/');
  }

  return (
    <div
      className="app-bg"
      style={{
        display: 'flex',
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      {/* Mobile scrim */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 40,
            }}
            className="sidebar-scrim"
          />
        ) : null}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        pathname={pathname}
        admin={admin}
        onSignOut={handleSignOut}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          marginLeft: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
          transition: 'margin-left .2s ease',
        }}
        className="dashboard-main-wrap"
      >
        {/* Mobile top bar */}
        <div
          className="dashboard-mobile-bar"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--sidebar-bg)',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-bright)',
              cursor: 'pointer',
            }}
          >
            <Menu size={16} />
          </button>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 800,
              color: 'var(--text-bright)',
              letterSpacing: '-0.01em',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background:
                  'linear-gradient(135deg, var(--emerald-bright), #6366f1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={11} style={{ color: '#ffffff' }} />
            </span>
            Chatty AI
          </span>
          <span style={{ width: 36 }} />
        </div>

        <main
          style={{
            padding: '40px 44px',
            color: 'var(--text-primary)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile-specific styles */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .dashboard-mobile-bar {
            display: flex !important;
          }
          .dashboard-main-wrap {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  pathname,
  admin,
  onSignOut,
}) {
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  // Per-group open state.
  const [groupOpen, setGroupOpen] = useState(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.id, g.defaultOpen]))
  );

  function toggleGroup(id) {
    setGroupOpen((curr) => ({ ...curr, [id]: !curr[id] }));
  }

  return (
    <aside
      className="dashboard-sidebar"
      data-mobile-open={mobileOpen ? 'true' : 'false'}
      style={{
        width,
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .2s ease, transform .2s ease',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '18px 0' : '18px 18px',
          borderBottom: '1px solid var(--border)',
          gap: 8,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'inherit',
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background:
                'linear-gradient(135deg, var(--emerald-bright), #6366f1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={15} style={{ color: '#ffffff' }} />
          </span>
          {collapsed ? null : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: 'var(--text-bright)',
                  letterSpacing: '-0.01em',
                }}
              >
                Chatty AI
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  padding: '2px 6px',
                  borderRadius: 6,
                  background: 'var(--emerald-tint)',
                  color: 'var(--emerald-bright)',
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  border: '1px solid rgba(16,185,129,0.3)',
                }}
              >
                AI OS
              </span>
            </span>
          )}
        </Link>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="dashboard-sidebar-close"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav body */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Main always-visible items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Groups */}
        {NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.id}
            group={group}
            open={!!groupOpen[group.id]}
            onToggle={() => toggleGroup(group.id)}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: collapsed ? 10 : 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Onboarding entry */}
        <NavLink
          item={{
            href: '/onboarding',
            label: 'Onboarding',
            icon: Rocket,
            sublabel: 'Setup',
            external: false,
          }}
          pathname={pathname}
          collapsed={collapsed}
        />

        {/* User card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 10,
            padding: collapsed ? '8px 0' : '10px 8px',
            borderRadius: 10,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title="Marcus Johnson · Summit Roofing"
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, var(--emerald-bright), #6366f1)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11.5,
              fontWeight: 800,
              flexShrink: 0,
              letterSpacing: '0.04em',
            }}
          >
            MJ
          </span>
          {collapsed ? null : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--text-bright)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Marcus Johnson
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Summit Roofing {admin ? '· Admin' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Admin sign-out (when present) */}
        {admin && !collapsed ? (
          <button
            type="button"
            onClick={onSignOut}
            style={{
              padding: '7px 10px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign out (Admin)
          </button>
        ) : null}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="dashboard-sidebar-collapse"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: collapsed ? '8px 0' : '8px 10px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          {collapsed ? null : <span>Collapse sidebar</span>}
        </button>
      </div>

      {/* Mobile slide-in styles */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
            width: 280px !important;
          }
          .dashboard-sidebar[data-mobile-open='true'] {
            transform: translateX(0);
          }
          .dashboard-sidebar-close {
            display: inline-flex !important;
          }
          .dashboard-sidebar-collapse {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// NavGroup — collapsible header + items
// ---------------------------------------------------------------------------

function NavGroup({ group, open, onToggle, pathname, collapsed }) {
  const hasActiveChild = group.items.some((i) =>
    isActive(pathname, i.href, i.exact)
  );

  if (collapsed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
        {group.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: hasActiveChild
            ? 'var(--text-bright)'
            : 'var(--text-subtle)',
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <span>{group.label}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-flex' }}
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                paddingTop: 2,
              }}
            >
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={false}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NavLink
// ---------------------------------------------------------------------------

function NavLink({ item, pathname, collapsed }) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href, item.exact);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 12,
        padding: collapsed ? '10px 0' : '9px 12px',
        borderRadius: 9,
        textDecoration: 'none',
        color: active ? 'var(--text-bright)' : 'var(--text-muted)',
        background: active ? 'rgba(16,185,129,0.10)' : 'transparent',
        borderLeft: collapsed
          ? '0 solid transparent'
          : active
            ? '2px solid var(--emerald-bright)'
            : '2px solid transparent',
        paddingLeft: collapsed ? 0 : 10,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        position: 'relative',
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: 'background .15s, color .15s',
      }}
    >
      <span
        style={{
          width: 22,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: active ? 'var(--emerald-bright)' : 'var(--text-muted)',
          flexShrink: 0,
        }}
      >
        <Icon size={15} />
      </span>
      {collapsed ? null : (
        <span
          style={{
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.label}
        </span>
      )}
      {!collapsed && item.sublabel ? (
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-subtle)',
            background: 'var(--surface-3)',
            border: '1px solid var(--border)',
            padding: '2px 6px',
            borderRadius: 6,
          }}
        >
          {item.sublabel}
        </span>
      ) : null}
      {!collapsed && item.pulse ? (
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--emerald-bright)',
            boxShadow: '0 0 8px var(--emerald-glow)',
            animation: 'pulse-dot 2s infinite',
          }}
        />
      ) : null}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isActive(pathname, href, exact) {
  if (!pathname) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
