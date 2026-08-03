import React from 'react';
import { Product, Order, Subscriber } from '../../types';
import { ShoppingCart, Package, Users, DollarSign, Clock, ArrowRight } from 'lucide-react';

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
  const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black uppercase text-white font-syne tracking-tight">
          EXECUTIVE OVERVIEW
        </h2>
        <p className="font-mono text-xs uppercase text-zinc-400 mt-1 font-bold tracking-wider">
          REAL-TIME TELEMETRY & STORE MANAGEMENT
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="bg-zinc-950 border border-white/20 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-xs uppercase font-bold">
            <span>TOTAL REVENUE</span>
            <DollarSign size={18} className="text-white" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white font-mono">${totalRevenue.toFixed(2)}</span>
            <span className="block text-[10px] font-mono text-zinc-500 uppercase mt-1 font-bold">Across all recorded orders</span>
          </div>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-zinc-950 border border-white/20 p-5 flex flex-col justify-between cursor-pointer hover:border-white transition-colors group"
        >
          <div className="flex items-center justify-between text-zinc-400 font-mono text-xs uppercase font-bold group-hover:text-white">
            <span>TOTAL ORDERS</span>
            <ShoppingCart size={18} className="text-white" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white font-mono">{orders.length}</span>
            <span className="block text-[10px] font-mono text-amber-400 uppercase mt-1 font-extrabold">
              {pendingOrders} ORDERS PENDING DISPATCH
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-zinc-950 border border-white/20 p-5 flex flex-col justify-between cursor-pointer hover:border-white transition-colors group"
        >
          <div className="flex items-center justify-between text-zinc-400 font-mono text-xs uppercase font-bold group-hover:text-white">
            <span>CATALOG PRODUCTS</span>
            <Package size={18} className="text-white" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white font-mono">{products.length}</span>
            <span className="block text-[10px] font-mono text-zinc-400 uppercase mt-1 font-bold">
              {products.filter((p) => p.stock_quantity <= 0).length} ITEMS SOLD OUT
            </span>
          </div>
        </div>

        {/* Subscribers */}
        <div
          onClick={() => onNavigateTab('subscribers')}
          className="bg-zinc-950 border border-white/20 p-5 flex flex-col justify-between cursor-pointer hover:border-white transition-colors group"
        >
          <div className="flex items-center justify-between text-zinc-400 font-mono text-xs uppercase font-bold group-hover:text-white">
            <span>SUBSCRIBERS</span>
            <Users size={18} className="text-white" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white font-mono">{subscribers.length}</span>
            <span className="block text-[10px] font-mono text-zinc-400 uppercase mt-1 font-bold">INSIDERS CLUB MEMBERS</span>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-zinc-950 border border-white/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg uppercase text-white font-syne">RECENT ORDERS</h3>
            <p className="font-mono text-xs uppercase text-zinc-400 font-bold">LATEST CUSTOMER ORDERS</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="flex items-center space-x-1 font-mono text-xs font-bold uppercase text-white hover:underline"
          >
            <span>VIEW ALL ORDERS</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-neutral-500 uppercase border border-white/5">
            NO ORDERS PLACED YET
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 uppercase">
                  <th className="py-3 px-3">ORDER ID</th>
                  <th className="py-3 px-3">CUSTOMER</th>
                  <th className="py-3 px-3">PHONE</th>
                  <th className="py-3 px-3">SUBTOTAL</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">#{ord.id}</td>
                    <td className="py-3 px-3 uppercase text-neutral-200">{ord.customer_name}</td>
                    <td className="py-3 px-3 text-neutral-400">{ord.phone}</td>
                    <td className="py-3 px-3 font-bold text-white">${ord.subtotal.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                          ord.status === 'pending'
                            ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                            : ord.status === 'confirmed'
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                            : ord.status === 'shipped'
                            ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                            : ord.status === 'delivered'
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                            : 'bg-red-900/60 text-red-300 border border-red-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-500">
                      {new Date(ord.created_at || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
