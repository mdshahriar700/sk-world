import React, { useState } from 'react';
import { Product, Order, Subscriber } from '../../types';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Banknote,
  ArrowUpRight,
  ArrowRight,
  AlertTriangle,
  MoreVertical,
  Mail,
  PieChart as PieChartIcon,
  ChevronRight,
  Send
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  subscribers: Subscriber[];
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  subscribers,
  onNavigateTab,
}) => {
  const [timeRange, setTimeRange] = useState<'month' | 'week' | 'year'>('month');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const lowStockProducts = products.filter((p) => p.stock_quantity <= 3);
  const recentOrders = orders.slice(0, 6);

  // Sales Chart Data Points
  const chartData = [
    { label: 'May 1', amount: 450 },
    { label: 'May 5', amount: 820 },
    { label: 'May 10', amount: 600 },
    { label: 'May 15', amount: 1250 },
    { label: 'May 20', amount: 980 },
    { label: 'May 25', amount: 1540 },
    { label: 'May 30', amount: 1890 },
  ];

  const maxChartAmount = 2200;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Dashboard</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Welcome back, Badol SK! Here is your daily retail breakdown.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Store Live</span>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TOP STATISTICS ROW (4 CARDS) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue Card */}
        <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
            <div className="p-2.5 bg-emerald-50 text-[#16A34A] rounded-2xl border border-emerald-100">
              <Banknote size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ৳{totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} />
              <span>+12.5% vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
              Total Orders
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {orders.length}
            </div>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                {pendingOrders} Pending Dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Catalog Products Card */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
              Products Catalog
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {products.length}
            </div>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="text-[11px] font-bold text-slate-500">
                {lowStockProducts.length} Items low stock
              </span>
            </div>
          </div>
        </div>

        {/* Subscribers Card */}
        <div
          onClick={() => onNavigateTab('subscribers')}
          className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
              Subscribers
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {subscribers.length}
            </div>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="text-[11px] font-bold text-blue-600">
                Insiders Club Members
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN SECTION: SALES OVERVIEW & RECENT ORDERS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Sales Overview Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-[20px] border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sales Overview</h2>
              <p className="text-xs text-slate-500">Gross revenue trends over time</p>
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              {(['month', 'week', 'year'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                    timeRange === r
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Interactive Area Chart */}
          <div className="relative h-56 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#F1F5F9" strokeDasharray="4 4" />

              {/* Area Fill */}
              <path
                d="M 0 160 L 0 145 C 50 120, 100 100, 150 115 C 200 130, 250 50, 300 80 C 350 110, 400 30, 500 20 L 500 160 Z"
                fill="url(#emeraldGradient)"
              />

              {/* Smooth Curve Stroke */}
              <path
                d="M 0 145 C 50 120, 100 100, 150 115 C 200 130, 250 50, 300 80 C 350 110, 400 30, 500 20"
                fill="none"
                stroke="#16A34A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interactive Data Points */}
              {chartData.map((pt, idx) => {
                const cx = (idx / (chartData.length - 1)) * 500;
                const cy = 160 - (pt.amount / maxChartAmount) * 140;
                return (
                  <g key={idx}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={hoveredPoint === idx ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#16A34A"
                      strokeWidth="3"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mt-2">
              {chartData.map((pt, i) => (
                <span key={i}>{pt.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Recent Orders Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-[20px] border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
              <p className="text-xs text-slate-500">Latest customer purchases</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#16A34A] hover:text-[#15803D] flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">
              No orders placed yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      #{ord.id}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ord.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{ord.phone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-900">
                      ৳{ord.subtotal.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase mt-0.5 ${
                        ord.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM ROW: 3 COLUMNS (CATEGORIES, LOW STOCK, SUBSCRIBERS) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Top Categories */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <PieChartIcon size={18} className="text-[#16A34A]" />
              <h3 className="font-bold text-slate-900 text-sm">Top Categories</h3>
            </div>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Manage
            </button>
          </div>

          {/* Donut Graphic */}
          <div className="flex items-center justify-around py-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="3.8"
                  strokeDasharray="45, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3.8"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-45"
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-sm font-extrabold text-slate-900">100%</span>
                <span className="block text-[9px] text-slate-400">Share</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                <span className="text-slate-700">Hoodies (45%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-700">T-Shirts (25%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-slate-500">Others (30%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Low Stock Alerts</h3>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              View All
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 font-medium">
              All inventory levels healthy.
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.slice(0, 3).map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518'}
                      alt={prod.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-slate-400">৳{prod.price}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                    {prod.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribers Growth Card */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Mail size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Subscribers</h3>
            </div>
            <button
              onClick={() => onNavigateTab('subscribers')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Broadcaster
            </button>
          </div>

          {subscribers.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 font-medium">
              No newsletter subscribers yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {subscribers.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                      {sub.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                      {sub.email}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
