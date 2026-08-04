import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, ArrowRight, Package, Truck, CreditCard, Tag, Percent } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OrderItem } from '../types';
import { formatPrice } from '../lib/format';
import { useTheme } from '../context/ThemeContext';

export const CheckoutModal: React.FC = () => {
  const { cart, subtotal, clearCart, isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const { theme } = useTheme();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [freeDeliveryApplied, setFreeDeliveryApplied] = useState<boolean>(false);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCheckoutOpen) return null;

  const isDark = theme === 'dark';
  const rawDeliveryFee = deliveryZone === 'inside_dhaka' ? 80 : 150;
  const deliveryFee = freeDeliveryApplied ? 0 : rawDeliveryFee;
  const grandTotal = Math.max(0, subtotal - discountAmount) + deliveryFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMessage(null);
    const code = promoInput.trim().toUpperCase();

    if (!code) return;

    if (code === 'SKWORL10' || code === 'SK10' || code === 'SUMMER10') {
      const disc = Math.round(subtotal * 0.10);
      setDiscountAmount(disc);
      setFreeDeliveryApplied(false);
      setAppliedPromo(code);
      setPromoMessage({ type: 'success', text: `10% Discount Applied (-${formatPrice(disc)})` });
    } else if (code === 'SKWORL20' || code === 'SK20' || code === 'BADOL20' || code === 'SUMMER20') {
      const disc = Math.round(subtotal * 0.20);
      setDiscountAmount(disc);
      setFreeDeliveryApplied(false);
      setAppliedPromo(code);
      setPromoMessage({ type: 'success', text: `20% Discount Applied (-${formatPrice(disc)})` });
    } else if (code === 'SUMMER30' || code === 'SK30') {
      const disc = Math.round(subtotal * 0.30);
      setDiscountAmount(disc);
      setFreeDeliveryApplied(false);
      setAppliedPromo(code);
      setPromoMessage({ type: 'success', text: `30% Flash Sale Discount Applied (-${formatPrice(disc)})` });
    } else if (code === 'BADOL100' || code === 'SK100') {
      const disc = Math.min(subtotal, 100);
      setDiscountAmount(disc);
      setFreeDeliveryApplied(false);
      setAppliedPromo(code);
      setPromoMessage({ type: 'success', text: `৳100 Discount Coupon Applied!` });
    } else if (code === 'FREESHIP' || code === 'FREE') {
      setDiscountAmount(0);
      setFreeDeliveryApplied(true);
      setAppliedPromo(code);
      setPromoMessage({ type: 'success', text: `Free Shipping Coupon Applied!` });
    } else {
      // General 10% promo code fallback for any promo code entered
      const disc = Math.round(subtotal * 0.10);
      setDiscountAmount(disc);
      setFreeDeliveryApplied(false);
      setAppliedPromo(code);
      setPromoMessage({ type: 'success', text: `Special Promo Code "${code}" Applied (-${formatPrice(disc)})!` });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setFreeDeliveryApplied(false);
    setPromoInput('');
    setPromoMessage(null);
  };

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
      imageUrl: Array.isArray(item.product.images) ? item.product.images[0] : '',
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone,
          address: `[Zone: ${deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}, Payment: ${paymentMethod.toUpperCase()}] ${address}`,
          items: itemsPayload,
          subtotal: grandTotal,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={handleClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Container */}
      <div className={`relative w-full max-w-[calc(100vw-24px)] sm:max-w-2xl border-2 shadow-2xl z-10 overflow-hidden my-4 sm:my-8 transition-colors ${
        isDark ? 'bg-zinc-950 text-white border-white/20' : 'bg-white text-zinc-900 border-zinc-300'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          isDark ? 'bg-black text-white border-white/10' : 'bg-stone-50 text-black border-zinc-200'
        }`}>
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
            <h2 className="font-black text-sm sm:text-base uppercase tracking-tight font-syne truncate">
              {orderSuccess ? 'ORDER CONFIRMED' : 'CHECKOUT — BANGLADESH DISPATCH'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-zinc-400 hover:text-white p-1 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto overflow-x-hidden">
          {orderSuccess ? (
            /* Order Confirmation State */
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                  ORDER ID #{orderSuccess.id}
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase font-syne">
                  THANK YOU, {orderSuccess.customer_name}!
                </h3>
                <p className="font-mono text-xs text-zinc-400 uppercase max-w-md mx-auto tracking-wider leading-relaxed">
                  Your order has been received! Our team will call or SMS you at {orderSuccess.phone} for delivery confirmation before dispatching.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className={`border p-4 text-left font-mono text-xs space-y-2.5 ${
                isDark ? 'bg-black border-white/20' : 'bg-stone-50 border-zinc-300'
              }`}>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold uppercase text-zinc-400">Delivery Address:</span>
                  <span className="font-bold text-right truncate max-w-[240px]">{orderSuccess.address}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold uppercase text-zinc-400">Phone Contact:</span>
                  <span className="font-bold">{orderSuccess.phone}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold uppercase text-xs">Total Amount (COD):</span>
                  <span className="font-black text-sm">{formatPrice(orderSuccess.subtotal)}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className={`px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest border transition-colors ${
                  isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
                }`}
              >
                RETURN TO STORE
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-950 border border-red-800 text-red-200 text-xs font-mono uppercase">
                  {error}
                </div>
              )}

              {/* Items Brief */}
              <div className={`p-3.5 border space-y-2 ${
                isDark ? 'bg-black border-white/10' : 'bg-stone-50 border-zinc-200'
              }`}>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-mono text-xs uppercase font-bold flex items-center space-x-1.5 tracking-wider">
                    <Package size={14} />
                    <span>ITEMS ({cart.length})</span>
                  </span>
                  <span className="font-mono text-xs font-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pt-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-mono">
                      <span className="truncate max-w-[260px]">
                        {item.quantity}x {item.product.name} ({item.selectedSize} / {item.selectedColor})
                      </span>
                      <span className="font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="space-y-3.5">
                <h3 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                  01 / SHIPPING & CONTACT DETAILS (BANGLADESH)
                </h3>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider mb-1 font-bold">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full border px-3.5 py-2.5 text-xs font-mono focus:outline-none font-bold ${
                      isDark ? 'bg-black border-white/20 text-white focus:border-white' : 'bg-stone-50 border-zinc-300 text-black focus:border-black'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider mb-1 font-bold">
                    PHONE NUMBER (BD 11-DIGIT MOBILE) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className={`w-full border px-3.5 py-2.5 text-xs font-mono focus:outline-none font-bold ${
                      isDark ? 'bg-black border-white/20 text-white focus:border-white' : 'bg-stone-50 border-zinc-300 text-black focus:border-black'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider mb-1 font-bold">
                    FULL DELIVERY ADDRESS *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Road / Area / Thana / District"
                    rows={2}
                    className={`w-full border px-3.5 py-2.5 text-xs font-mono focus:outline-none font-bold resize-none ${
                      isDark ? 'bg-black border-white/20 text-white focus:border-white' : 'bg-stone-50 border-zinc-300 text-black focus:border-black'
                    }`}
                    required
                  />
                </div>

                {/* Delivery Zone Selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider font-bold flex items-center space-x-1">
                    <Truck size={13} />
                    <span>DELIVERY LOCATION *</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryZone('inside_dhaka')}
                      className={`p-2.5 border text-left font-mono text-xs uppercase flex flex-col justify-between transition-all ${
                        deliveryZone === 'inside_dhaka'
                          ? isDark ? 'bg-white text-black border-white font-black' : 'bg-black text-white border-black font-black'
                          : isDark ? 'bg-black text-zinc-300 border-white/20' : 'bg-stone-100 text-zinc-700 border-zinc-300'
                      }`}
                    >
                      <span className="font-bold">INSIDE DHAKA</span>
                      <span className="text-[10px] opacity-80">CHARGE: ৳80 (1-2 DAYS)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryZone('outside_dhaka')}
                      className={`p-2.5 border text-left font-mono text-xs uppercase flex flex-col justify-between transition-all ${
                        deliveryZone === 'outside_dhaka'
                          ? isDark ? 'bg-white text-black border-white font-black' : 'bg-black text-white border-black font-black'
                          : isDark ? 'bg-black text-zinc-300 border-white/20' : 'bg-stone-100 text-zinc-700 border-zinc-300'
                      }`}
                    >
                      <span className="font-bold">OUTSIDE DHAKA</span>
                      <span className="text-[10px] opacity-80">CHARGE: ৳150 (2-4 DAYS)</span>
                    </button>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider font-bold flex items-center space-x-1">
                    <CreditCard size={13} />
                    <span>PAYMENT METHOD *</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 border text-left font-mono text-xs uppercase flex flex-col justify-between transition-all ${
                        paymentMethod === 'cod'
                          ? isDark ? 'bg-white text-black border-white font-black' : 'bg-black text-white border-black font-black'
                          : isDark ? 'bg-black text-zinc-300 border-white/20' : 'bg-stone-100 text-zinc-700 border-zinc-300'
                      }`}
                    >
                      <span className="font-bold">CASH ON DELIVERY</span>
                      <span className="text-[10px] opacity-80">PAY WHEN RECEIVED</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-2.5 border text-left font-mono text-xs uppercase flex flex-col justify-between transition-all ${
                        paymentMethod === 'bkash'
                          ? isDark ? 'bg-white text-black border-white font-black' : 'bg-black text-white border-black font-black'
                          : isDark ? 'bg-black text-zinc-300 border-white/20' : 'bg-stone-100 text-zinc-700 border-zinc-300'
                      }`}
                    >
                      <span className="font-bold">BKASH / NAGAD</span>
                      <span className="text-[10px] opacity-80">PAYMENT ON DISPATCH</span>
                    </button>
                  </div>
                </div>

                {/* Promo Code / Coupon Section */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block font-bold">
                    PROMO CODE / COUPON
                  </label>
                  {!appliedPromo ? (
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Try SKWORL10, BADOL20, FREE..."
                          className={`w-full font-mono text-xs pl-8 pr-3 py-2 border uppercase focus:outline-none transition-all ${
                            isDark
                              ? 'bg-zinc-900 border-white/20 text-white placeholder-zinc-500 focus:border-white'
                              : 'bg-stone-50 border-zinc-300 text-black placeholder-zinc-400 focus:border-black'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border transition-colors ${
                          isDark
                            ? 'bg-white text-black border-white hover:bg-zinc-200'
                            : 'bg-black text-white border-black hover:bg-zinc-800'
                        }`}
                      >
                        APPLY
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-mono">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                        <Tag size={14} />
                        <span>CODE: {appliedPromo}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                          APPLIED
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-red-400 hover:text-red-300 text-xs font-bold underline ml-2"
                      >
                        REMOVE
                      </button>
                    </div>
                  )}

                  {promoMessage && !appliedPromo && (
                    <p className={`text-[10px] font-mono ${promoMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {promoMessage.text}
                    </p>
                  )}
                </div>

              </div>

              {/* Order Breakdown */}
              <div className={`p-3 border font-mono text-xs space-y-1.5 ${
                isDark ? 'bg-black border-white/10' : 'bg-stone-100 border-zinc-200'
              }`}>
                <div className="flex justify-between text-zinc-400">
                  <span>SUBTOTAL:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>PROMO DISCOUNT ({appliedPromo}):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>DELIVERY CHARGE ({deliveryZone === 'inside_dhaka' ? 'DHAKA' : 'OUTSIDE DHAKA'}):</span>
                  <span>{freeDeliveryApplied ? 'FREE (PROMO)' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-zinc-500">
                  <span>TOTAL AMOUNT:</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors border ${
                    isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
                  }`}
                >
                  <span>{loading ? 'CONFIRMING ORDER...' : `CONFIRM ORDER — ${formatPrice(grandTotal)}`}</span>
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

