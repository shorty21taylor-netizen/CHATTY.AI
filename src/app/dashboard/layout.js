'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Zap,
  Bot,
  BarChart3,
  MessageSquare,
  Users,
  Mic,
  GitBranch,
  CalendarCheck,
  FileText,
  Settings,
  Plug,
  CreditCard,
  RefreshCw,
  DollarSign,
  Briefcase,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Sparkles,
  FlaskConical,
} from 'lucide-react';
import { getAdminSession, clearAdminSession } from '@/lib/admin';
import { hydrateFromServer } from '@/lib/agents/storage';

// ---------------------------------------------------------------------------
// Navigation config
// ---------------------------------------------------------------------------

const NAV_GROUPS = [
  {
    id: 'command-center',
    label: 'Command Center',
    icon: Home,
    defaultOpen: true,
    items: [
      { href: '/dashboard', label: 'Today', icon: Home, exact: true },
      { href: '/dashboard/business-profile', label: 'Business Profile', icon: Briefcase },
      { href: '/dashboard/brief', label: 'Daily Brief', icon: Zap, pulse: true },
      { href: '/dashboard/brief/preferences', label: 'Brief Preferences', icon: Settings },
    ],
  },
  {
    id: 'deliverables',
    label: 'Deliverables',
    icon: Zap,
    defaultOpen: true,
    items: [
      { href: '/dashboard/speed-to-lead', label: 'Speed to Lead', icon: Zap },
      { href: '/dashboard/booked-calls', label: 'Booked Calls', icon: CalendarCheck },
      { href: '/dashboard/follow-ups', label: 'Active Follow-Ups', icon: RefreshCw },
      { href: '/dashboard/proposals-out', label: 'Proposals Out', icon: FileText },
      { href: '/dashboard/closed', label: 'Closed Revenue', icon: DollarSign },
    ],
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: Bot,
    defaultOpen: true,
    items: [
      { href: '/dashboard/agents', label: 'All Agents', icon: Bot },
      { href: '/dashboard/agents/voice-receptionist', label: 'Voice Receptionist', icon: Mic },
      { href: '/dashboard/agents/telegram-ea', label: 'Telegram EA', icon: MessageSquare },
      { href: '/dashboard/agents/simulations', label: 'Simulations', icon: FlaskConical },
      { href: '/dashboard/templates', label: 'Templates', icon: FileText },
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: Users,
    defaultOpen: true,
    items: [
      { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: BarChart3,
    defaultOpen: true,
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
      { href: '/dashboard/pipeline', label: 'Pipeline', icon: GitBranch },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultOpen: false,
    items: [
      { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
      { href: '/dashboard/voice', label: 'Voice Library', icon: Mic },
      { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
      { href: '/dashboard/admin', label: 'Admin', icon: Settings },
      { href: '/dashboard/admin/forms', label: 'Forms', icon: FileText },
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
    hydrateFromServer();
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
              background: 'rgba(0,0,0,0.4)',
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
            background: 'var(--bg)',
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
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              color: 'var(--text-heading)',
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
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-heading)',
              letterSpacing: '-0.01em',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'var(--primary)',
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
            color: 'var(--text-body)',
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
        background:
          'linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-deep) 100%)',
        borderRight: 'none',
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
          padding: collapsed ? '20px 0 16px' : '20px 18px 16px',
          borderBottom: `1px solid var(--sidebar-border)`,
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
              borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={15} style={{ color: '#ffffff' }} />
          </span>
          {collapsed ? null : (
            <>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--sidebar-text-bright)',
                  letterSpacing: '-0.02em',
                }}
              >
                Chatty AI
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'var(--sidebar-badge-bg)',
                  color: 'var(--sidebar-badge-text)',
                }}
              >
                AI OS
              </span>
            </>
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
            color: 'var(--sidebar-text-muted)',
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
          padding: '6px 0 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
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
          borderTop: '1px solid var(--sidebar-border)',
          padding: collapsed ? 10 : 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* User card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 10,
            padding: collapsed ? '8px 0' : '10px 12px',
            borderRadius: 10,
            background: 'var(--sidebar-user-bg)',
            border: '1px solid var(--sidebar-user-border)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title="Marcus Johnson · Summit Roofing"
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)',
              color: 'var(--sidebar-active-text)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11.5,
              fontWeight: 700,
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
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--sidebar-text-bright)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Marcus Johnson
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--sidebar-text-muted)',
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
              padding: '8px 0',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--sidebar-signout-border)',
              color: 'var(--sidebar-text)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all .12s',
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
            border: 'none',
            color: 'var(--sidebar-text-muted)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          {collapsed ? null : <span>Collapse</span>}
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
    <div style={{ marginTop: 4 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 18px 8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: hasActiveChild
            ? 'var(--sidebar-text-bright)'
            : 'var(--sidebar-section-label)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <span>{group.label}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.15 }}
          style={{ display: 'inline-flex', color: 'var(--sidebar-chevron)' }}
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
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
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
  const [hover, setHover] = useState(false);

  const background = active
    ? 'var(--sidebar-active-bg)'
    : hover
    ? 'var(--sidebar-hover-bg)'
    : 'transparent';
  const textColor = active
    ? 'var(--sidebar-active-text)'
    : 'var(--sidebar-text)';
  const iconColor = active
    ? 'var(--sidebar-icon-active)'
    : 'var(--sidebar-icon)';

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '10px 0' : '8px 14px',
        margin: collapsed ? '2px 0' : '2px 8px',
        borderRadius: 8,
        textDecoration: 'none',
        color: textColor,
        background,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        position: 'relative',
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: 'background .12s, color .12s',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 22,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
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
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: active
              ? 'var(--sidebar-active-text)'
              : 'var(--sidebar-text-muted)',
            background: active
              ? 'rgba(15,107,58,0.08)'
              : 'var(--sidebar-badge-bg)',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          {item.sublabel}
        </span>
      ) : null}
      {!collapsed && item.pulse ? (
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--sidebar-dot)',
            boxShadow: '0 0 8px rgba(52,211,153,0.5)',
            marginLeft: 'auto',
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
