import React, { useState } from 'react';
import { Order } from '../../types';
import { ShoppingCart, Search, Eye, Filter, CheckCircle2, Truck, XCircle, Clock } from 'lucide-react';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onRefresh }) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm) ||
      o.id.toString().includes(searchTerm);
    const matchesStatus = selectedStatusFilter === 'all' || o.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: number, status: Order['status']) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        onRefresh();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track customer orders, delivery addresses and dispatch statuses.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[20px] border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, customer or phone..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3 py-2 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16A34A] focus:bg-white"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl uppercase transition-all whitespace-nowrap ${
                selectedStatusFilter === st
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      #{ord.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{ord.customer_name}</p>
                        <p className="text-[11px] text-slate-400">{ord.phone}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {ord.items?.[0]?.imageUrl && (
                          <img
                            src={ord.items[0].imageUrl}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover border border-slate-200"
                          />
                        )}
                        <span className="text-slate-600 font-medium">
                          {ord.items?.length || 1} item(s)
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ৳{ord.subtotal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as Order['status'])}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer uppercase ${
                          ord.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : ord.status === 'confirmed' || ord.status === 'shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(ord.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewingOrder(ord)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Full Order Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Order Details #{viewingOrder.id}</h3>
                <p className="text-xs text-slate-400">Placed on {new Date(viewingOrder.created_at || Date.now()).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ×
              </button>
            </div>

            {/* Customer Information */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900">{viewingOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-bold text-slate-900">{viewingOrder.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Shipping Address:</span>
                <p className="font-semibold text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                  {viewingOrder.address}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Ordered Items</span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl max-h-48 overflow-y-auto">
                {viewingOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-md object-cover" />}
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[10px] text-slate-400">
                          Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-700 text-sm">Total Payable (Cash on Delivery):</span>
              <span className="font-black text-[#16A34A] text-lg">৳{viewingOrder.subtotal.toLocaleString()}</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewingOrder(null)}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-semibold text-xs hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
