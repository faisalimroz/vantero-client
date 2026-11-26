'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateProfile, addSavedAddress, deleteSavedAddress } from '@/lib/api';
import { User, MapPin, Plus, Trash2, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, loading, openAuthModal, refreshUser, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // New address modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('Dhaka');
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setNewRecipient(user.name || '');
      setNewPhone(user.phone || '');
    }
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <Navbar transparentOnTop={false} />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-ink-900">Sign In to View Account</h1>
          <p className="text-xs text-ink-500">Manage saved Bangladeshi addresses and review past orders.</p>
          <Button variant="primary" size="lg" className="w-full" onClick={() => openAuthModal('/account')}>
            Sign In with Google
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile({ name, email, phone });
      await refreshUser();
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    try {
      await addSavedAddress({
        recipientName: newRecipient,
        phone: newPhone,
        streetAddress: newStreet,
        city: newCity,
        district: newDistrict,
        isDefault: (user?.savedAddresses?.length || 0) === 0,
      });
      await refreshUser();
      setShowAddAddress(false);
      setNewStreet('');
      setNewCity('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add address');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Remove this delivery address?')) return;
    try {
      await deleteSavedAddress(id);
      await refreshUser();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete address');
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col mt-12">
      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left">
        {/* Navigation Tabs */}
        <div className="flex border-b border-line pb-4 mb-8 justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              Customer Account
            </h1>
            <p className="text-xs text-ink-500 mt-0.5">
              Phone: <strong>+{user?.phone || 'Not linked'}</strong>
            </p>
          </div>

          <Link href="/account/orders">
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>My Orders & Tracking</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Profile Details Form */}
          <div className="lg:col-span-5 bg-white border border-line rounded-sm p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-900 border-b border-line pb-2.5">
              Personal Information
            </h2>

            {profileMsg && (
              <div className="p-3 bg-cream border border-line text-xs text-ink-800 rounded-sm">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="customer@vantero.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Contact Mobile (For Delivery Rider)"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Button type="submit" variant="primary" size="md" isLoading={profileSaving}>
                Save Changes
              </Button>
            </form>
          </div>

          {/* Saved Delivery Addresses */}
          <div className="lg:col-span-7 bg-white border border-line rounded-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                Saved Delivery Addresses (Bangladesh)
              </h2>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-xs font-semibold text-gold-500 hover:text-ink-900 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Address
              </button>
            </div>

            {/* Address Modal/Form inline */}
            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="p-4 bg-cream/70 border border-line rounded-sm space-y-3 animate-fadeIn">
                <h3 className="text-xs font-bold text-ink-900">New Destination Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Recipient Name"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    required
                  />
                  <Input
                    label="Recipient Phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Street / House Address"
                  placeholder="House 20, Road 4, Sector 7"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="City / Area"
                    placeholder="Uttara"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    required
                  />
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-medium uppercase tracking-wider text-ink-600">
                      District
                    </label>
                    <select
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-line rounded-sm text-sm"
                    >
                      {['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Gazipur', 'Narayanganj'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button type="submit" variant="primary" size="sm" isLoading={addressSaving}>
                    Save Address
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddAddress(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Address List */}
            {(!user?.savedAddresses || user.savedAddresses.length === 0) ? (
              <p className="text-xs text-ink-500 py-6 text-center">
                No delivery addresses saved yet. You can save addresses for 1-click Cash on Delivery checkout.
              </p>
            ) : (
              <div className="space-y-3">
                {user.savedAddresses.map((addr: any) => (
                  <div
                    key={addr._id}
                    className="p-4 border border-line rounded-sm flex items-start justify-between bg-paper"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-ink-900">{addr.recipientName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-ink-900 text-white font-mono px-1.5 py-0.5 rounded-xs">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-600">{addr.phone}</p>
                      <p className="text-xs text-ink-700">
                        {addr.streetAddress}, {addr.city}, {addr.district}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-ink-400 hover:text-rose-500 p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
