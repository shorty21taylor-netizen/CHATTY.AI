'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Target, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/crm', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/crm/contacts', label: 'Contacts', icon: Users },
  { href: '/crm/leads', label: 'Leads', icon: Target },
  { href: '/crm/jobs', label: 'Jobs', icon: Briefcase },
];

export default function CrmNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-1 border-b border-[var(--border)]"
      aria-label="CRM sections"
    >
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              active
                ? 'text-[var(--emerald-bright)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-bright)]'
            )}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {active ? (
              <span
                aria-hidden
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--emerald-bright)]"
                style={{ boxShadow: '0 0 8px var(--emerald-glow)' }}
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
