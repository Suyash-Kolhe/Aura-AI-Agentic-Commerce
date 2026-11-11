import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import {
  TrendOrderInput,
  calculateOrderTrends,
  OrderTrendPoint,
} from '../utils/commerce';

interface OrderTrendsChartProps {
  orders: TrendOrderInput[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: OrderTrendPoint;
  }>;
}

function CustomOrderTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-xl bg-[#0b0719]/95 border border-purple-500/40 p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
      <div className="font-bold text-white max-w-[210px] truncate">{point.name}</div>
      <div className="flex items-center justify-between gap-4 text-zinc-300">
        <span>Spending Volume:</span>
        <span className="font-mono font-bold text-emerald-400">
          ${point.spending.toFixed(2)} USD
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 text-zinc-300">
        <span>Order Frequency:</span>
        <span className="font-mono font-semibold text-purple-300">
          {point.orders} {point.orders === 1 ? 'order' : 'orders'}
        </span>
      </div>
      <div className="text-[11px] text-zinc-400 pt-1 border-t border-white/10 flex items-center justify-between gap-3">
        <span>{point.capturedOrders} captured</span>
        <span>·</span>
        <span>{point.pendingOrders} pending</span>
        <span>·</span>
        <span className="font-mono text-zinc-300">Avg ${point.avgOrderValue.toFixed(0)}</span>
      </div>
    </div>
  );
}

export default function OrderTrendsChart({ orders }: OrderTrendsChartProps) {
  const [groupBy, setGroupBy] = useState<'category' | 'timeline'>('category');
  const analytics = calculateOrderTrends(orders);
  const chartData =
    groupBy === 'category' ? analytics.categoryTrends : analytics.timelineTrends;

  return (
    <div
      id="order-trends-chart-card"
      aria-label="Order Frequency and Spending Trends Chart"
      className="mb-3.5 p-3.5 rounded-xl bg-black/35 border border-white/10 space-y-3"
    >
      {/* Header & View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white leading-tight">
              Order Frequency &amp; Spending Trends
            </h3>
            <p className="text-[11px] text-zinc-400">
              Live volume ($ USD) &amp; order count across active ledger
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Chart grouping mode"
          className="inline-flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10"
        >
          <button
            type="button"
            onClick={() => setGroupBy('category')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              groupBy === 'category'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            By Category
          </button>
          <button
            type="button"
            onClick={() => setGroupBy('timeline')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              groupBy === 'timeline'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            By Order
          </button>
        </div>
      </div>

      {/* Summary Metric Strip (Unboxed clean typography with separators) */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg bg-white/[0.03] border border-white/5 text-[11px]">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span>Total Spend:</span>
          <strong className="font-mono text-emerald-400 tabular-nums">
            ${analytics.totalSpend.toFixed(2)}
          </strong>
        </div>
        <span aria-hidden="true" className="text-zinc-600">
          ·
        </span>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span>Frequency:</span>
          <strong className="font-mono text-purple-300 tabular-nums">
            {analytics.totalOrders} {analytics.totalOrders === 1 ? 'Order' : 'Orders'}
          </strong>
        </div>
        <span aria-hidden="true" className="text-zinc-600">
          ·
        </span>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span>Avg Order:</span>
          <strong className="font-mono text-zinc-200 tabular-nums">
            ${analytics.averageOrderValue.toFixed(0)}
          </strong>
        </div>
      </div>

      {/* Recharts BarChart */}
      {chartData.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-zinc-500 font-mono">
          No matching order data to chart
        </div>
      ) : (
        <div className="w-full h-48 pt-1" data-testid="recharts-order-trends-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 6, left: -12, bottom: 2 }}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="shortName"
                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="spend"
                orientation="left"
                tickFormatter={(val: number) => `$${val}`}
                tick={{ fill: '#34d399', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={46}
              />
              <YAxis
                yAxisId="freq"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: '#c084fc', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={26}
              />
              <Tooltip
                content={<CustomOrderTooltip />}
                cursor={{ fill: 'rgba(139, 92, 246, 0.12)' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                yAxisId="spend"
                dataKey="spending"
                name="Spending ($ USD)"
                fill="#10b981"
                radius={[5, 5, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                yAxisId="freq"
                dataKey="orders"
                name="Order Frequency"
                fill="#8b5cf6"
                radius={[5, 5, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
