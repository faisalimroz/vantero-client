'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Search, User as UserIcon, ShoppingBag, Menu, X, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Headers from '../../public/Frame.png';

interface NavbarProps {
  transparentOnTop?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparentOnTop = true }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, openAuthModal, logout } = useAuth();
  const { itemsCount, openCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'New In', href: '/shop?sort=newest' },
    { name: 'Sneakers', href: '/shop?category=sneakers' },
    { name: 'Clothing', href: '/shop?category=clothing' },
    { name: 'Fragrance', href: '/shop?category=fragrance' },
    { name: 'Lifestyle', href: '/shop?category=lifestyle' },
    { name: 'The Boys Edit', href: '/shop?category=the-boys-edit' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const isSticky = isScrolled || !transparentOnTop;

  return (
    <>
      {/* <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isSticky
            ? 'h-[56px] bg-paper/90 backdrop-blur-md border-b border-line shadow-sm'
            : 'h-[76px] bg-transparent text-ink-900'
          }`}
      > */}
      <header className="fixed top-0 left-0 right-0 z-40 h-[68px] bg-paper/95 backdrop-blur-md border-b border-line text-ink-900">
        <div className="relative mx-auto h-full px-4 sm:px-6 lg:px-6 2xl:px-8 flex items-center justify-between">
          {/* Left: Mobile Menu Trigger + Desktop Navigation Links */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-ink-900 focus:outline-none lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <nav className="hidden lg:flex items-center lg:space-x-3 xl:space-x-5 2xl:space-x-7 lg:text-[11px] xl:text-xs font-medium uppercase lg:tracking-normal xl:tracking-wider text-ink-900">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="hover:text-gold-500 transition-colors py-1 relative group whitespace-nowrap"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold-500 transition-all duration-200 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Dead-Center Brand Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <Link
              href="/"
              className="pointer-events-auto hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <Image
                src={Headers}
                alt="Vantero Logo"
                width={120}
                height={40}
                priority
                className="w-20 sm:w-24 lg:w-[96px] xl:w-[110px] 2xl:w-[120px] h-auto object-contain"
              />
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 xl:space-x-4 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-ink-900 hover:text-gold-500 transition-colors rounded-full"
              title="Search collection"
            >
              <Search className="w-4 h-4 xl:w-5 xl:h-5" />
            </button>

            {/* User Account / Login */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-1 p-1.5 text-xs text-ink-900 hover:text-gold-500 transition-colors rounded-sm font-medium whitespace-nowrap"
                  >
                    <UserIcon className="w-4 h-4 xl:w-5 xl:h-5" />
                    <span className="hidden md:inline-block max-w-[75px] xl:max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-paper border border-line shadow-dropdown rounded-sm py-2 text-left animate-fadeIn">
                      <div className="px-4 py-2 border-b border-line text-xs">
                        <p className="font-semibold text-ink-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-ink-500 truncate">{user.phone || user.email}</p>
                      </div>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-semibold text-gold-500 hover:bg-cream transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 mr-2" /> Admin Panel
                        </Link>
                      )}

                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-ink-800 hover:bg-cream transition-colors"
                      >
                        My Account
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-ink-800 hover:bg-cream transition-colors"
                      >
                        Orders & Live Tracking
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="p-2 text-ink-900 hover:text-gold-500 transition-colors"
                  title="Sign In"
                >
                  <UserIcon className="w-4 h-4 xl:w-5 xl:h-5" />
                </button>
              )}
            </div>

            {/* Shopping Bag Trigger with Quantity Badge */}
            <button
              onClick={openCart}
              className="relative p-2 text-ink-900 hover:text-gold-500 transition-colors"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 xl:w-5 xl:h-5" />
              {itemsCount > 0 && (
                <span className="absolute top-1 right-0.5 bg-ink-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Mobile slide down navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-paper border-b border-line shadow-lg px-6 py-6 space-y-4 animate-fadeIn">
            <nav className="flex flex-col space-y-3 text-sm font-medium uppercase tracking-wider text-ink-900">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 border-b border-line/50 hover:text-gold-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Quick Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-paper border border-line rounded-md p-6 shadow-2xl relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 p-1 text-ink-500 hover:text-ink-900"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-overline text-gold-500">Discover Vantero</p>
              <div className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-3 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search footwear, overcoats, trousers, extrait..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-24 py-3 bg-white border border-line rounded-sm text-base text-ink-900 focus:outline-none focus:border-ink-900"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 bg-ink-900 text-white text-xs font-semibold rounded-sm hover:bg-ink-800"
                >
                  Search
                </button>
              </div>

              {/* Suggested quick chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-ink-600">
                <span className="text-ink-400">Suggestions:</span>
                {['Court Low', 'Wool Overcoat', 'Oud Extrait', 'Tailored Pants'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      router.push(`/shop?q=${encodeURIComponent(tag)}`);
                      setSearchOpen(false);
                    }}
                    className="px-2.5 py-1 bg-cream hover:bg-stone rounded-sm transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
