"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RiskDistributionChart({
  low,
  medium,
  high,
  unassessed = 0,
}: {
  low: number;
  medium: number;
  high: number;
  unassessed?: number;
}) {
  const data = [
    { name: "Low", n: low },
    { name: "Medium", n: medium },
    { name: "High", n: high },
    ...(unassessed > 0 ? [{ name: "Not assessed", n: unassessed }] : []),
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="#D4DCE6" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="n" fill="#1A56B0" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
