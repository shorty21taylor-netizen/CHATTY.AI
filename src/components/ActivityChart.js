'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { day: 'Mon', speedToLead: 38, reactivation: 18, followUps: 112, bookedCalls: 14 },
  { day: 'Tue', speedToLead: 42, reactivation: 21, followUps: 128, bookedCalls: 16 },
  { day: 'Wed', speedToLead: 35, reactivation: 19, followUps: 98, bookedCalls: 12 },
  { day: 'Thu', speedToLead: 51, reactivation: 27, followUps: 145, bookedCalls: 19 },
  { day: 'Fri', speedToLead: 47, reactivation: 23, followUps: 142, bookedCalls: 18 },
  { day: 'Sat', speedToLead: 28, reactivation: 12, followUps: 67, bookedCalls: 8 },
  { day: 'Sun', speedToLead: 22, reactivation: 9, followUps: 54, bookedCalls: 6 },
];

export default function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          stroke="var(--border)"
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          stroke="var(--border)"
        />
        <Tooltip
          contentStyle={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Line
          type="monotone"
          dataKey="followUps"
          name="Follow-Up Texts"
          stroke="#ec4899"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="speedToLead"
          name="Speed-to-Lead"
          stroke="var(--emerald-bright)"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="reactivation"
          name="Dead Lead Reactiv"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="bookedCalls"
          name="Booked Calls"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
