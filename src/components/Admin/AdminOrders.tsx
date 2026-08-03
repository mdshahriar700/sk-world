import React, { useState } from 'react';
import { Order } from '../../types';
import { ShoppingBag, Eye, CheckCircle2, Phone, MapPin, User, Calendar } from 'lucide-react';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Network request error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase text-white font-sans tracking-tight">
          ORDER DISPATCH & FULFILLMENT
        </h2>
        <p className="font-mono text-xs uppercase text-neutral-400 mt-1">
          VIEW CUSTOMER DETAILS, ORDERED ITEMS, AND UPDATE DISPATCH STATUS
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-neutral-900 border border-white/10 p-12 text-center font-mono text-xs text-neutral-400 uppercase">
          NO ORDERS LOGGED IN THE SYSTEM YET
        </div>
      ) : (
        <div className="bg-neutral-900 border border-white/10 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 uppercase bg-black/40">
                <th className="py-3 px-4">ORDER ID</th>
                <th className="py-3 px-4">CUSTOMER NAME</th>
                <th className="py-3 px-4">PHONE</th>
                <th className="py-3 px-4">ADDRESS</th>
                <th className="py-3 px-4">ITEMS</th>
                <th className="py-3 px-4">TOTAL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">#{ord.id}</td>
                  <td className="py-3 px-4 uppercase text-neutral-200 font-bold">{ord.customer_name}</td>
                  <td className="py-3 px-4 text-neutral-300">{ord.phone}</td>
                  <td className="py-3 px-4 text-neutral-400 truncate max-w-[200px]">{ord.address}</td>
                  <td className="py-3 px-4 text-neutral-300">
                    {Array.isArray(ord.items) ? `${ord.items.length} items` : '1 item'}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">${ord.subtotal.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <select
                      disabled={updatingId === ord.id}
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className={`font-mono text-[11px] font-bold uppercase px-2 py-1 bg-black border cursor-pointer focus:outline-none ${
                        ord.status === 'pending'
                          ? 'border-amber-500 text-amber-400'
                          : ord.status === 'confirmed'
                          ? 'border-blue-500 text-blue-400'
                          : ord.status === 'shipped'
                          ? 'border-purple-500 text-purple-400'
                          : ord.status === 'delivered'
                          ? 'border-emerald-500 text-emerald-400'
                          : 'border-red-500 text-red-400'
                      }`}
                    >
                      <option value="pending">PENDING</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="shipped">SHIPPED</option>
                      <option value="delivered">DELIVERED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs flex items-center space-x-1 ml-auto"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">VIEW DETAIL</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-neutral-900 border-2 border-white text-white p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase font-bold">DISPATCH DOSSIER</span>
                <h3 className="text-xl font-bold uppercase font-sans">ORDER #{selectedOrder.id}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-white font-mono text-xs">
                CLOSE [X]
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs bg-black p-4 border border-white/10">
              <div className="space-y-1">
                <span className="text-neutral-500 uppercase block">CUSTOMER:</span>
                <span className="font-bold text-white uppercase">{selectedOrder.customer_name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-500 uppercase block">PHONE CONTACT:</span>
                <span className="font-bold text-amber-400">{selectedOrder.phone}</span>
              </div>
              <div className="sm:col-span-2 space-y-1 border-t border-white/10 pt-2">
                <span className="text-neutral-500 uppercase block">DELIVERY ADDRESS:</span>
                <span className="text-neutral-200 uppercase">{selectedOrder.address}</span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase text-neutral-400">ORDER ITEMS BREAKDOWN:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="bg-black p-3 border border-white/10 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="font-bold text-white uppercase">{item.productName}</span>
                      <span className="block text-[10px] text-neutral-400">
                        SIZE: {item.size} | COLOR: {item.color} | QTY: {item.quantity}
                      </span>
                    </div>
                    <span className="font-extrabold text-amber-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between font-mono border-t border-white/10 pt-4">
              <span className="text-xs uppercase text-neutral-400">TOTAL ORDER AMOUNT:</span>
              <span className="text-xl font-extrabold text-white">${selectedOrder.subtotal.toFixed(2)}</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
