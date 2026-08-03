import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OrderItem } from '../types';

export const CheckoutModal: React.FC = () => {
  const { cart, subtotal, clearCart, isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !address) {
      setError('Please fill in all customer details');
      return;
    }

    if (cart.length === 0) {
      setError('Your shopping bag is empty');
      return;
    }

    setLoading(true);
    setError('');

    const itemsPayload: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      size: item.selectedSize,
      color: item.selectedColor,
      quantity: item.quantity,
      imageUrl: item.product.images[0],
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone,
          address,
          items: itemsPayload,
          subtotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data.order);
        clearCart();
      } else {
        setError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setError('Network request failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderSuccess(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={handleClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-zinc-950 text-white border-2 border-white/20 shadow-2xl z-10 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={22} className="text-white" />
            <h2 className="font-black text-lg uppercase tracking-tighter font-syne">
              {orderSuccess ? 'ORDER CONFIRMED' : 'EXPRESS CHECKOUT'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-zinc-400 hover:text-white p-1">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {orderSuccess ? (
            /* Order Confirmation State */
            <div className="text-center space-y-6 py-6">
              <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
                  ORDER ID #{orderSuccess.id}
                </span>
                <h3 className="text-2xl font-black uppercase text-white font-syne">
                  THANK YOU, {orderSuccess.customer_name}!
                </h3>
                <p className="font-mono text-xs text-zinc-400 uppercase max-w-md mx-auto tracking-wider">
                  Your order has been logged into our Milano dispatch system. Our team has received your details via Telegram alert and will dispatch your package shortly.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-black border border-white/20 p-4 text-left font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold uppercase text-zinc-400">Delivery Address:</span>
                  <span className="text-white">{orderSuccess.address}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold uppercase text-zinc-400">Phone Contact:</span>
                  <span className="text-white">{orderSuccess.phone}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold uppercase text-sm text-zinc-300">Total Paid:</span>
                  <span className="font-extrabold text-sm text-white">${orderSuccess.subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="bg-white text-black px-8 py-3.5 font-mono text-xs font-extrabold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors border border-white"
              >
                RETURN TO STORE
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-950 border border-red-800 text-red-200 text-xs font-mono uppercase">
                  {error}
                </div>
              )}

              {/* Items Brief */}
              <div className="bg-black p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-mono text-xs uppercase font-bold text-white flex items-center space-x-1.5 tracking-wider">
                    <Package size={14} />
                    <span>ORDER ITEMS ({cart.length})</span>
                  </span>
                  <span className="font-mono text-xs font-extrabold text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-2 pt-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-mono text-zinc-300">
                      <span className="truncate max-w-[280px]">
                        {item.quantity}x {item.product.name} ({item.selectedSize} / {item.selectedColor})
                      </span>
                      <span className="font-extrabold text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-400">
                  01 / SHIPPING & CONTACT DETAILS
                </h3>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1 font-bold">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="E.G. MARCO ROSSI"
                    className="w-full bg-black border border-white/20 px-3.5 py-3 text-xs font-mono uppercase text-white focus:outline-none focus:border-white font-bold tracking-wider"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1 font-bold">
                    PHONE NUMBER (FOR DISPATCH SMS / TELEGRAM NOTIFICATION) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.G. +39 345 678 9012"
                    className="w-full bg-black border border-white/20 px-3.5 py-3 text-xs font-mono uppercase text-white focus:outline-none focus:border-white font-bold tracking-wider"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1 font-bold">
                    COMPLETE SHIPPING ADDRESS *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="STREET ADDRESS, CITY, POSTAL CODE, COUNTRY"
                    rows={3}
                    className="w-full bg-black border border-white/20 px-3.5 py-3 text-xs font-mono uppercase text-white focus:outline-none focus:border-white font-bold tracking-wider resize-none"
                    required
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-4 font-mono text-xs font-extrabold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 border border-white"
                >
                  <span>{loading ? 'PROCESSING ORDER...' : `CONFIRM ORDER — $${subtotal.toFixed(2)}`}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
