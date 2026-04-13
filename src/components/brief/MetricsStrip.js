'use client';

import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Gauge,
  DollarSign,
  Target,
  Timer,
  Wallet,
  PieChart,
} from 'lucide-react';

function sparkline(values) {
  return values.map((v, i) => ({ i, value: v }));
}

const MOCK_METRICS = [
  {
    key: 'lead_quality',
    label: 'Lead Quality Score',
    icon: Gauge,
    value: '8.4',
    unit: '/10',
    trend: 6.2,
    benchmark: 'vs. 7.1 avg',
    color: '#10b981',
    data: sparkline([7.2, 7.5, 7.1, 7.8, 8.0, 8.1, 8.4]),
  },
  {
    key: 'ad_roi',
    label: 'Ad Spend ROI',
    icon: DollarSign,
    value: '3.8x',
    unit: '',
    trend: 12.5,
    benchmark: 'vs. 2.9x goal',
    color: '#818cf8',
    data: sparkline([2.1, 2.6, 2.9, 3.0, 3.3, 3.6, 3.8]),
  },
  {
    key: 'conversion',
    label: 'Conversion Rate',
    icon: Target,
    value: '31%',
    unit: '',
    trend: 4.1,
    benchmark: 'vs. 27% last wk',
    color: '#f472b6',
    data: sparkline([24, 26, 25, 28, 29, 30, 31]),
  },
  {
    key: 'response_time',
    label: 'Response Time',
    icon: Timer,
    value: '14m',
    unit: 'avg',
    trend: -22.4,
    benchmark: 'vs. 18m SLA',
    color: '#fbbf24',
    positiveDown: true,
    data: sparkline([22, 20, 19, 17, 18, 15, 14]),
  },
  {
    key: 'pipeline',
    label: 'Pipeline Value',
    icon: Wallet,
    value: '$184k',
    unit: '',
    trend: 9.7,
    benchmark: 'vs. $168k wk avg',
    color: '#10b981',
    data: sparkline([142, 151, 158, 164, 170, 176, 184]),
  },
  {
    key: 'close_rate',
    label: 'Close Rate',
    icon: PieChart,
    value: '42%',
    unit: '',
    trend: -1.8,
    benchmark: 'vs. 44% last 30d',
    color: '#fb7185',
    data: sparkline([46, 45, 44, 43, 42, 43, 42]),
  },
];

function MetricCard({ metric, delay }) {
  const Icon = metric.icon;
  const positive = metric.positiveDown ? metric.trend < 0 : metric.trend > 0;
  const TrendIcon = metric.trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = positive
    ? 'var(--emerald-bright)'
    : '#fb7185';

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="group cursor-pointer rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg border"
          style={{
            background: `color-mix(in srgb, ${metric.color} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${metric.color} 35%, transparent)`,
            color: metric.color,
          }}
        >
          <Icon size={14} />
        </div>
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums"
          style={{ color: trendColor }}
        >
          <TrendIcon size={12} />
          {Math.abs(metric.trend).toFixed(1)}%
        </span>
      </div>
      <div className="mt-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {metric.label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums text-[var(--text-bright)]">
          {metric.value}
        </span>
        {metric.unit ? (
          <span className="text-xs text-[var(--text-muted)]">{metric.unit}</span>
        ) : null}
      </div>
      <div className="mt-1 text-[11px] text-[var(--text-muted)]">
        {metric.benchmark}
      </div>
      <div className="mt-3 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={metric.data}
            margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`grad-${metric.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.55} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-bright)',
                fontSize: 11,
                padding: '2px 8px',
              }}
              labelFormatter={() => ''}
              formatter={(v) => [v, metric.label]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={1.8}
              fill={`url(#grad-${metric.key})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.article>
  );
}

export default function MetricsStrip({ metrics }) {
  // Map any real micro_metrics into the card shape, else use mocks.
  const cards = MOCK_METRICS;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--text-bright)]">
            Micro-metrics
          </h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            7-day rolling trend vs. benchmark.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((m, i) => (
          <MetricCard key={m.key} metric={m} delay={i * 0.04} />
        ))}
      </div>
    </div>
  );
}
