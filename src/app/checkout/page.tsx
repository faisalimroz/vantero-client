'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, getSiteSettings } from '@/lib/api';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatBDT, resolveImageUrl } from '@/lib/utils';
import { ShieldCheck, Truck, CreditCard, Lock, Check, ArrowRight, Building2 } from 'lucide-react';

const BD_DISTRICTS = [
  'Dhaka',
  'Chattogram (Chittagong)',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Gazipur',
  'Narayanganj',
  'Cumilla',
  'Bogura',
  'Cox\'s Bazar',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { user, loading: authLoading, openAuthModal } = useAuth();

  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [shippingSettings, setShippingSettings] = useState({
    insideDhakaCharge: 100,
    outsideDhakaCharge: 150,
    freeDeliveryThreshold: 5000,
  });

  // Fetch admin-configured shipping settings
  useEffect(() => {
    getSiteSettings()
      .then((res) => {
        if (res?.success && res.settings) {
          setShippingSettings({
            insideDhakaCharge: res.settings.insideDhakaCharge ?? 100,
            outsideDhakaCharge: res.settings.outsideDhakaCharge ?? 150,
            freeDeliveryThreshold: res.settings.freeDeliveryThreshold ?? 5000,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Pre-fill from user profile or saved address
  useEffect(() => {
    if (user) {
      if (user.savedAddresses && user.savedAddresses.length > 0) {
        const defaultAddr = user.savedAddresses.find((a) => a.isDefault) || user.savedAddresses[0];
        setRecipientName(defaultAddr.recipientName || user.name || '');
        setPhone(defaultAddr.phone || user.phone || '');
        setEmail(user.email || '');
        setStreetAddress(defaultAddr.streetAddress || '');
        setCity(defaultAddr.city || '');
        const dist = defaultAddr.district || 'Dhaka';
        setDistrict(dist);
        setPostalCode(defaultAddr.postalCode || '');
        setDeliveryArea(dist.toLowerCase().includes('dhaka') ? 'inside_dhaka' : 'outside_dhaka');
      } else {
        setRecipientName(user.name || '');
        setPhone(user.phone || '');
        setEmail(user.email || '');
      }
    }
  }, [user]);

  // Delivery fee calculation based on selected area & threshold
  const isInsideDhaka = deliveryArea === 'inside_dhaka';
  const hasFreeThreshold = shippingSettings.freeDeliveryThreshold > 0;
  const isFreeDelivery = isInsideDhaka && hasFreeThreshold && subtotal >= shippingSettings.freeDeliveryThreshold;

  let deliveryFee = isInsideDhaka ? shippingSettings.insideDhakaCharge : shippingSettings.outsideDhakaCharge;
  if (isFreeDelivery) {
    deliveryFee = 0;
  }
  const totalAmount = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (!recipientName || !phone || !streetAddress || !city || !district) {
      setError('Please complete all delivery address fields.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          title: item.title,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        deliveryArea,
        shippingAddress: {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          district: district.trim(),
          postalCode: postalCode.trim(),
        },
        customerNotes: customerNotes.trim(),
      };

      const res = await createOrder(orderData);
      if (res?.success && res?.order?.orderNumber) {
        clearCart();
        router.push(`/order-confirmed/${res.order.orderNumber}`);
      } else {
        throw new Error(res?.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error creating order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col mt-12">
      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-10 w-full text-left">
        <div className="border-b border-line pb-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Cash on Delivery Checkout
          </h1>
          {user ? (
            <p className="text-xs text-ink-500 mt-1">
              Logged in as <strong>{user.name}</strong> ({user.phone || user.email})
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
              <p className="text-xs text-ink-500">
                Checking out as Guest · 100% Cash on Delivery nationwide
              </p>
              <button
                type="button"
                onClick={() => openAuthModal('/checkout')}
                className="text-xs text-gold-600 hover:text-gold-700 font-semibold underline text-left"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Delivery Address Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Address Form Card */}
            <div className="bg-white border border-line rounded-sm p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-900 border-b border-line pb-2.5">
            Delivery Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Recipient Full Name"
                  placeholder="e.g. Tanzim Ahmed"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />

                <Input
                  label="Contact Mobile (For Delivery Rider)"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  label="Email Address (Optional — For Order Receipt)"
                  type="email"
                  placeholder="e.g. tanzim@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Required Delivery Area * Selector Cards */}
              <div className="space-y-2 pt-1 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900">
                  Delivery Area <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Card 1: Inside Dhaka */}
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryArea('inside_dhaka');
                      setDistrict('Dhaka');
                    }}
                    className={`relative p-4 rounded-sm transition-all text-left flex items-start justify-between ${
                      deliveryArea === 'inside_dhaka'
                        ? 'border-2 border-ink-900 bg-paper shadow-sm'
                        : 'border border-[#E5E7EB] bg-white hover:border-ink-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xs flex items-center justify-center shrink-0 transition-colors ${
                          deliveryArea === 'inside_dhaka'
                            ? 'bg-ink-900 text-white'
                            : 'bg-stone text-ink-600'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink-900">Inside Dhaka</h4>
                        <p className="text-[11px] text-ink-500 mt-0.5">2-3 Days Home Delivery</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch">
                      <span className="text-xs font-mono font-bold text-ink-900">
                        {isFreeDelivery ? (
                          <span className="text-emerald-600 font-semibold uppercase text-[11px]">FREE</span>
                        ) : (
                          formatBDT(shippingSettings.insideDhakaCharge)
                        )}
                      </span>
                      {deliveryArea === 'inside_dhaka' && (
                        <div className="w-4 h-4 rounded-full bg-ink-900 text-white flex items-center justify-center mt-2">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Card 2: Outside Dhaka */}
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryArea('outside_dhaka');
                      if (district === 'Dhaka') setDistrict('Chattogram (Chittagong)');
                    }}
                    className={`relative p-4 rounded-sm transition-all text-left flex items-start justify-between ${
                      deliveryArea === 'outside_dhaka'
                        ? 'border-2 border-ink-900 bg-paper shadow-sm'
                        : 'border border-[#E5E7EB] bg-white hover:border-ink-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xs flex items-center justify-center shrink-0 transition-colors ${
                          deliveryArea === 'outside_dhaka'
                            ? 'bg-ink-900 text-white'
                            : 'bg-stone text-ink-600'
                        }`}
                      >
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink-900">Outside Dhaka</h4>
                        <p className="text-[11px] text-ink-500 mt-0.5">3-5 Days Home Delivery</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch">
                      <span className="text-xs font-mono font-bold text-ink-900">
                        {formatBDT(shippingSettings.outsideDhakaCharge)}
                      </span>
                      {deliveryArea === 'outside_dhaka' && (
                        <div className="w-4 h-4 rounded-full bg-ink-900 text-white flex items-center justify-center mt-2">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              <Input
                label="Street Address / House / Flat / Road"
                placeholder="House 12, Road 5, Block C"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium uppercase tracking-wider text-ink-600">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDistrict(val);
                      if (val.toLowerCase().includes('dhaka')) {
                        setDeliveryArea('inside_dhaka');
                      } else {
                        setDeliveryArea('outside_dhaka');
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-line rounded-sm text-sm text-ink-900 focus:outline-none focus:border-ink-900"
                    required
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="City / Thana / Area"
                  placeholder="e.g. Dhanmondi, Banani, Uttara"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />

                <Input
                  label="Postal Code (Optional)"
                  placeholder="1205"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-ink-600">
                  Delivery Notes / Gate Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Leave with security guard, call before arrival..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-line rounded-sm text-sm text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
            </div>

            {/* Strict Payment Override: Cash on Delivery Only */}
            <div className="bg-white border border-line rounded-sm p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-900 border-b border-line pb-2.5">
             Payment Method
              </h2>

              <div className="p-4 bg-cream border-2 border-ink-900 rounded-sm flex items-start space-x-3.5">
                <div className="p-2 bg-ink-900 text-white rounded-full mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-ink-900">
                    Cash on Delivery (COD) Only
                  </h3>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Pay in cash directly to our courier upon doorstep delivery and parcel inspection. No online prepayment, cards, or mobile wallets required.
                  </p>
                  <span className="inline-block text-[10px] uppercase font-mono font-bold text-gold-600 tracking-wider">
                    Official Vantero COD Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-line rounded-sm p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-900 border-b border-line pb-2.5">
                Package Summary ({cart.length} item{cart.length === 1 ? '' : 's'})
              </h2>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-line/60 pr-1 space-y-2">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color || ''}`} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 truncate">
                      <img src={resolveImageUrl(item.image)} alt="" className="w-10 h-12 object-cover rounded-xs border border-line flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-ink-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-ink-500 font-mono">
                          Qty: {item.quantity} · Size: {item.size} {item.color && `· Color: ${item.color}`}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-ink-900 ml-2">
                      {formatBDT(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-line space-y-2 text-xs text-ink-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-ink-900">{formatBDT(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>
                    Delivery ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})
                  </span>
                  <span className="font-mono font-semibold text-ink-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">
                        FREE ({shippingSettings.freeDeliveryThreshold > 0 ? `over ৳${shippingSettings.freeDeliveryThreshold.toLocaleString()}` : 'unlocked'})
                      </span>
                    ) : (
                      formatBDT(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-line flex justify-between text-base font-bold text-ink-900">
                  <span>Total Amount Due on Delivery</span>
                  <span className="font-mono text-lg">{formatBDT(totalAmount)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center space-x-2 mt-4"
                isLoading={isSubmitting}
                disabled={cart.length === 0}
              >
                <span>Confirm Order with Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="pt-3 border-t border-line/60 flex items-center justify-center space-x-1.5 text-[11px] text-ink-500">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                <span>Zero Risk · 7-day free return/exchange guarantee</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
