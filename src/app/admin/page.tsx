'use client';

import React, { useState, useEffect } from 'react';
import { getAdminAnalytics } from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { KpiCard } from '@/components/admin/KpiCard';
import { formatBDT, resolveImageUrl } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  Package,
  RotateCcw,
  Percent,
  ShieldCheck,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706',
  confirmed: '#2563EB',
  processing: '#9333EA',
  shipped: '#0284C7',
  delivered: '#16A34A',
  cancelled: '#DC2626',
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [range, setRange] = useState('this_month');
  const [loading, setLoading] = useState(true);

  const fetchStats = (selectedRange: string) => {
    setLoading(true);
    getAdminAnalytics(selectedRange)
      .then((res) => {
        if (res?.success) setStats(res.stats);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats(range);
  }, [range]);

  const kpis = stats?.kpis || {};
  const monthlyTrends = stats?.monthlyTrends || [];
  const statusDistribution = stats?.statusDistribution || [];
  const topProducts = stats?.topProducts || [];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Executive Analytics & Revenue"
        subtitle="Live performance metrics, revenue comparisons, and order status insights"
        actions={
          <div className="flex items-center space-x-2">
            <span className="text-xs text-ink-500 hidden sm:inline">Range:</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-line rounded-sm text-xs font-semibold text-ink-900 focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
        }
      />

      <div className="p-6 sm:p-8 space-y-8 flex-1">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <KpiCard
            title="Total Revenue"
            value={formatBDT(kpis.totalRevenue || 0)}
            subtitle="Lifetime gross revenue"
            icon={DollarSign}
            variant="gold"
          />

          <KpiCard
            title="Monthly Revenue"
            value={formatBDT(kpis.monthlyRevenue || 0)}
            subtitle="Current calendar month"
            icon={TrendingUp}
            variant="success"
            badge="This Month"
          />

          <KpiCard
            title="Yearly Revenue"
            value={formatBDT(kpis.yearlyRevenue || 0)}
            subtitle={`Year ${new Date().getFullYear()} total`}
            icon={Calendar}
            variant="default"
          />

          <KpiCard
            title="Total Orders"
            value={(kpis.totalOrders || 0).toLocaleString()}
            subtitle={`${kpis.monthlyOrders || 0} placed this month`}
            icon={ShoppingBag}
            variant="default"
          />

          <KpiCard
            title="Pending COD Orders"
            value={(kpis.pendingCodOrders || 0).toLocaleString()}
            subtitle="Awaiting phone confirmation"
            icon={Clock}
            variant="alert"
            badge="Action Needed"
          />

          <KpiCard
            title="Delivered Orders"
            value={(kpis.deliveredOrders || 0).toLocaleString()}
            subtitle="Cash collected successfully"
            icon={CheckCircle}
            variant="success"
          />

          <KpiCard
            title="Total Customers"
            value={(kpis.totalCustomers || 0).toLocaleString()}
            subtitle="Registered Google members"
            icon={Users}
            variant="default"
          />

          <KpiCard
            title="Yearly Orders"
            value={(kpis.yearlyOrders || 0).toLocaleString()}
            subtitle="Completed order volume"
            icon={Package}
            variant="gold"
          />
        </div>

        {/* Returns & Net Financial Performance Strip */}
        <div className="bg-white border border-line rounded-sm p-6 space-y-4 text-left shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-gold-500" />
                Post-Delivery Returns & Net Financial Summary
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Automatically nets out completed returns and tracks product return rates in BDT (৳)
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-gold-600 bg-cream px-2.5 py-1 rounded-xs border border-line">
              7-Day Doorstep Guarantee
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-3.5 bg-cream/50 rounded-sm border border-line">
              <span className="text-xs text-ink-600 font-medium block">Net Revenue</span>
              <p className="text-xl font-bold font-mono text-ink-900 mt-0.5">
                {formatBDT(kpis.netRevenue ?? kpis.totalRevenue ?? 0)}
              </p>
              <span className="text-[10px] text-ink-400 font-mono block mt-0.5">
                Gross ({formatBDT(kpis.totalRevenue || 0)}) − Settled Returns
              </span>
            </div>

            <div className="p-3.5 bg-cream/50 rounded-sm border border-line">
              <span className="text-xs text-ink-600 font-medium block">Total Returns</span>
              <p className="text-xl font-bold font-mono text-ink-900 mt-0.5">
                {kpis.totalReturns || 0}
              </p>
              <span className="text-[10px] text-ink-400 font-mono block mt-0.5">
                Return requests filed
              </span>
            </div>

            <div className="p-3.5 bg-cream/50 rounded-sm border border-line">
              <span className="text-xs text-ink-600 font-medium block">Returned Units</span>
              <p className="text-xl font-bold font-mono text-ink-900 mt-0.5">
                {kpis.returnedUnits || 0} items
              </p>
              <span className="text-[10px] text-ink-400 font-mono block mt-0.5">
                Physical pieces returned
              </span>
            </div>

            <div className="p-3.5 bg-cream/50 rounded-sm border border-line">
              <span className="text-xs text-ink-600 font-medium block">Return Value</span>
              <p className="text-xl font-bold font-mono text-rose-700 mt-0.5">
                {formatBDT(kpis.returnValue || 0)}
              </p>
              <span className="text-[10px] text-ink-400 font-mono block mt-0.5">
                Settled: {formatBDT(kpis.completedReturnValue || 0)}
              </span>
            </div>

            <div className="p-3.5 bg-cream/50 rounded-sm border border-line">
              <span className="text-xs text-ink-600 font-medium block">Return Rate</span>
              <p className="text-xl font-bold font-mono text-gold-600 mt-0.5">
                {kpis.returnRate || 0}%
              </p>
              <span className="text-[10px] text-ink-400 font-mono block mt-0.5">
                of delivered orders
              </span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Revenue & Orders Trend Area Chart */}
          <div className="lg:col-span-8 bg-white border border-line rounded-sm p-6 space-y-4 text-left shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Monthly Revenue Trend (BDT ৳)
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">Trailing 12-month aggregated gross revenue</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends.length > 0 ? monthlyTrends : [{ name: 'Nov 2026', revenue: 28525 }]}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  {/* Solid straight lines (no strokeDasharray) */}
                  <CartesianGrid stroke="#E6E1D8" opacity={0.8} />
                  <XAxis dataKey="name" stroke="#6E6E73" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#6E6E73"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ stroke: '#10B981', strokeWidth: 1.5 }}
                    formatter={(val: any) => [formatBDT(val), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FBFAF7',
                      borderColor: '#10B981',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    dot={{
                      r: 6,
                      fill: '#10B981',
                      stroke: '#FFFFFF',
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 8,
                      fill: '#047857',
                      stroke: '#FFFFFF',
                      strokeWidth: 2.5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution Donut Chart */}
          <div className="lg:col-span-4 bg-white border border-line rounded-sm p-6 space-y-4 text-left shadow-card">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                Order Status Breakdown
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">Active fulfillment & delivery pipeline</p>
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution.length > 0 ? statusDistribution : [{ status: 'shipped', count: 1 }]}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusDistribution.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || '#1C1C1E'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} orders`, `Status: ${name}`]}
                    contentStyle={{ backgroundColor: '#FBFAF7', borderColor: '#E6E1D8', borderRadius: 4, fontSize: 12 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(val) => <span className="text-[11px] text-ink-700 uppercase font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top-Selling Products Table */}
        <div className="bg-white border border-line rounded-sm p-6 space-y-4 text-left shadow-card">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                Top-Selling Pieces
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">Highest volume sales across all categories</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-line text-ink-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Base Price</th>
                  <th className="py-2.5 px-3 text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {topProducts.map((p: any) => (
                  <tr key={p._id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-3 flex items-center space-x-3">
                      <img
                        src={resolveImageUrl(p.images?.[0]?.url) || ''}
                        alt=""
                        className="w-8 h-10 object-cover rounded-xs border border-line flex-shrink-0"
                      />
                      <span className="font-semibold text-ink-900">{p.title}</span>
                    </td>
                    <td className="py-3 px-3 text-ink-600 uppercase text-[11px]">
                      {p.category?.name || 'General'}
                    </td>
                    <td className="py-3 px-3 font-mono text-ink-500">{p.sku}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-ink-900">
                      {formatBDT(p.basePrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-gold-500">
                      {p.salesCount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
