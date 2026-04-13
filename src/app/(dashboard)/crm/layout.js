import CrmNav from '@/components/crm/CrmNav';

export const metadata = {
  title: 'CRM — Chatty AI',
};

export default function CrmLayout({ children }) {
  return (
    <div
      className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]"
      data-theme="dark"
    >
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text-bright)] tracking-tight">
            CRM
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Built-in lightweight CRM — every action feeds the Decision Engine.
          </p>
        </header>
        <CrmNav />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
