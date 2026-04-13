import CrmNav from '@/components/crm/CrmNav';

export const metadata = {
  title: 'CRM — Chatty AI',
};

export default function CrmLayout({ children }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--text-bright)] tracking-tight">
          CRM
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Built-in lightweight CRM — every action feeds the Decision Engine.
        </p>
      </header>
      <CrmNav />
      <div>{children}</div>
    </div>
  );
}
