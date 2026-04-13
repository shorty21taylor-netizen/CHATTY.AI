'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import TodayBriefCard from '@/components/brief/TodayBriefCard';
import SignalFeed from '@/components/brief/SignalFeed';
import MetricsStrip from '@/components/brief/MetricsStrip';
import QuickActionsPanel from '@/components/brief/QuickActionsPanel';

export default function MissionControlPage() {
  const [today, setToday] = useState(null);
  const [signals, setSignals] = useState([]);
  const [recent, setRecent] = useState([]);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [todayRes, feedRes, listRes, metricsRes] = await Promise.all([
          fetch('/api/brief/today').catch(() => null),
          fetch('/api/signals/feed?since_hours=24&limit=30').catch(() => null),
          fetch('/api/brief?limit=7').catch(() => null),
          fetch('/api/metrics?days=7').catch(() => null),
        ]);

        const [todayData, feedData, listData, metricsData] = await Promise.all([
          todayRes && todayRes.ok ? todayRes.json() : Promise.resolve(null),
          feedRes && feedRes.ok ? feedRes.json() : Promise.resolve(null),
          listRes && listRes.ok ? listRes.json() : Promise.resolve(null),
          metricsRes && metricsRes.ok ? metricsRes.json() : Promise.resolve(null),
        ]);

        if (cancelled) return;
        setToday(todayData?.brief ?? null);
        setSignals(feedData?.events ?? []);
        setRecent(listData?.briefs ?? []);
        setMetrics(metricsData?.metrics ?? []);
      } catch {
        // Silent — mock data renders when fetches fail.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Page header */}
      <header className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{
            background: 'rgba(16,185,129,0.1)',
            borderColor: 'rgba(16,185,129,0.3)',
            color: 'var(--emerald-bright)',
          }}
        >
          <Crosshair size={18} />
        </div>
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-[var(--text-bright)] sm:text-3xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Mission Control
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Your Daily Brief, signal stream, and KPIs — one pane of glass.
          </p>
        </div>
      </header>

      {/* Main grid: 2/3 content + 1/3 sidebar on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <TodayBriefCard brief={today} />
          <SignalFeed events={signals} />
          <MetricsStrip metrics={metrics} />
        </div>

        <QuickActionsPanel recentBriefs={recent} />
      </div>
    </motion.div>
  );
}
