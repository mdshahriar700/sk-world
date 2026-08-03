import React, { useState } from 'react';
import { Search, PackageCheck, Truck, Clock, CheckCircle2, XCircle, AlertCircle, Phone, X, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import { useTheme } from '../context/ThemeContext';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTrackSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim()) {
      setErrorMsg('Please enter your Order ID or Phone Number');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(queryInput.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to track order');
      }

      if (!Array.isArray(data) || data.length === 0) {
        setErrorMsg('No orders found matching your search. Please check your Order ID or Phone Number.');
      } else {
        setOrders(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while tracking your order.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 1;
      case 'confirmed':
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-colors max-h-[90vh] flex flex-col ${
          isDark ? 'bg-zinc-950 border-white/20 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10 bg-zinc-900/50' : 'border-zinc-200 bg-stone-50'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-black text-[#16A34A] border-white/10' : 'bg-white text-[#16A34A] border-zinc-200 shadow-sm'}`}>
              <Truck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">Track Your Order</h2>
              <p className="text-xs text-zinc-500 font-mono">Enter Order ID (e.g. #102) or Mobile Phone Number</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-600 hover:text-black'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Search Form */}
          <form onSubmit={handleTrackSearch} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Order ID (e.g. 102) or Phone Number (017...)"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border font-mono text-sm focus:outline-none transition-all ${
                    isDark
                      ? 'bg-black border-white/20 text-white placeholder:text-zinc-600 focus:border-[#16A34A]'
                      : 'bg-stone-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-[#16A34A]'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 text-sm uppercase tracking-wider shrink-0 disabled:opacity-50"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                <span>Track</span>
              </button>
            </div>
          </form>

          {/* Error / Empty Message */}
          {errorMsg && (
            <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${isDark ? 'bg-red-950/40 border-red-800/50 text-red-300' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-bold mb-0.5">Order Not Found</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Results List */}
          {orders && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const step = getStatusStep(order.status);
                const isCancelled = step === -1;

                return (
                  <div
                    key={order.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isDark ? 'bg-black/60 border-white/10' : 'bg-stone-50/80 border-zinc-200 shadow-sm'
                    }`}
                  >
                    {/* Order Meta Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-200/20 mb-4">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-[#16A34A] uppercase tracking-wider block">
                          ORDER ID #{order.id}
                        </span>
                        <h3 className="font-black text-base">{order.customer_name}</h3>
                        <p className="text-xs text-zinc-500 font-mono">{order.phone} • {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase tracking-wide border ${
                          isCancelled
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : order.status === 'delivered'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : order.status === 'shipped'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          STATUS: {order.status}
                        </span>
                        <p className="text-sm font-extrabold mt-1 font-mono">৳{order.subtotal.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Progress Tracker Bar */}
                    {!isCancelled ? (
                      <div className="mb-6">
                        <div className="grid grid-cols-4 gap-2 relative">
                          {/* Step 1: Pending */}
                          <div className="text-center">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1.5 ${
                              step >= 1 ? 'bg-[#16A34A] text-white' : isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-400'
                            }`}>
                              {step > 1 ? <CheckCircle2 size={16} /> : 1}
                            </div>
                            <span className={`text-[10px] font-mono font-bold block uppercase ${step >= 1 ? 'text-[#16A34A]' : 'text-zinc-500'}`}>
                              Order Placed
                            </span>
                          </div>

                          {/* Step 2: Confirmed / Processing */}
                          <div className="text-center">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1.5 ${
                              step >= 2 ? 'bg-[#16A34A] text-white' : isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-400'
                            }`}>
                              {step > 2 ? <CheckCircle2 size={16} /> : 2}
                            </div>
                            <span className={`text-[10px] font-mono font-bold block uppercase ${step >= 2 ? 'text-[#16A34A]' : 'text-zinc-500'}`}>
                              Processing
                            </span>
                          </div>

                          {/* Step 3: Shipped */}
                          <div className="text-center">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1.5 ${
                              step >= 3 ? 'bg-[#16A34A] text-white' : isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-400'
                            }`}>
                              {step > 3 ? <CheckCircle2 size={16} /> : 3}
                            </div>
                            <span className={`text-[10px] font-mono font-bold block uppercase ${step >= 3 ? 'text-[#16A34A]' : 'text-zinc-500'}`}>
                              Out For Delivery
                            </span>
                          </div>

                          {/* Step 4: Delivered */}
                          <div className="text-center">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1.5 ${
                              step >= 4 ? 'bg-[#16A34A] text-white' : isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-400'
                            }`}>
                              4
                            </div>
                            <span className={`text-[10px] font-mono font-bold block uppercase ${step >= 4 ? 'text-[#16A34A]' : 'text-zinc-500'}`}>
                              Delivered
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono font-bold flex items-center space-x-2">
                        <XCircle size={16} />
                        <span>THIS ORDER HAS BEEN CANCELLED</span>
                      </div>
                    )}

                    {/* Delivery Address */}
                    <div className="mb-4 text-xs font-mono text-zinc-500">
                      <span className="text-zinc-400 font-bold block mb-0.5">DELIVERY ADDRESS:</span>
                      <p className="p-2.5 rounded-lg border bg-stone-100/50 dark:bg-zinc-900/50 dark:border-white/10 border-zinc-200">
                        {order.address}
                      </p>
                    </div>

                    {/* Item Breakdown */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-extrabold uppercase text-zinc-400 block">
                        ORDERED ITEMS ({order.items.length})
                      </span>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                              isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'
                            }`}
                          >
                            <div>
                              <p className="font-bold">{item.productName}</p>
                              <p className="text-[11px] text-zinc-500 font-mono">
                                Size: <span className="text-zinc-300 font-bold">{item.size}</span> | Color: <span className="text-zinc-300 font-bold">{item.color}</span> | Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-mono font-bold">৳{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs ${isDark ? 'border-white/10 bg-zinc-900/50' : 'border-zinc-200 bg-stone-50'}`}>
          <div className="flex items-center space-x-2 text-zinc-500 font-mono">
            <Phone size={14} className="text-[#16A34A]" />
            <span>Need Help? Call 01700-000000</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-xs border ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700 border-white/10 text-white' : 'bg-zinc-200 hover:bg-zinc-300 border-zinc-300 text-zinc-900'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
