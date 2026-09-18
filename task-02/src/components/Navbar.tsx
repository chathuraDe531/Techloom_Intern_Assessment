import React from 'react';
import { ShoppingBag, Package, Activity, Search, ShieldCheck, Clock } from 'lucide-react';

interface NavbarProps {
  activeTab: 'shop' | 'orders' | 'checkout';
  setActiveTab: (tab: 'shop' | 'orders' | 'checkout') => void;
  cartCount: number;
  openCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openDiagnostics: () => void;
  activeReservationExpiresAt?: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  searchQuery,
  setSearchQuery,
  openDiagnostics,
  activeReservationExpiresAt,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="brand-home-button"
              onClick={() => setActiveTab('shop')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold tracking-tight shadow-sm group-hover:bg-indigo-600 transition-colors">
                <ShieldCheck className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base tracking-tight leading-none block">
                  APEX STORE
                </span>
                <span className="text-[11px] font-medium text-slate-500 leading-none">
                  Secure Checkout & Payments
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar (shown primarily on shop tab) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search-input-header"
                type="text"
                placeholder="Search audio, wearables, tech, footwear..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'shop') setActiveTab('shop');
                }}
                className="w-full pl-10 pr-4 py-1.5 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-transparent focus:border-slate-300 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Nav Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Reservation Alert pill if checkout reservation in flight */}
            {activeReservationExpiresAt && (
              <button
                onClick={() => setActiveTab('checkout')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300/80 rounded-full animate-pulse hover:bg-amber-100 transition-colors"
                title="Active Stock Lease Active"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Stock Reserved</span>
              </button>
            )}

            {/* View Navigation Tabs */}
            <nav className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-semibold">
              <button
                id="nav-shop-tab"
                onClick={() => setActiveTab('shop')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'shop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shop
              </button>
              <button
                id="nav-orders-tab"
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'orders'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Orders</span>
              </button>
            </nav>

            {/* Diagnostics / System Inspector button */}
            <button
              id="system-diagnostics-btn"
              onClick={openDiagnostics}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative"
              title="System Diagnostics & Live Stock Ledger"
            >
              <Activity className="w-5 h-5 text-slate-700" />
              <span className="sr-only">Diagnostics</span>
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-button"
              onClick={openCart}
              className="relative flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-medium text-sm shadow-xs transition-transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-slate-200" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span
                  id="header-cart-badge"
                  className="w-5 h-5 flex items-center justify-center bg-indigo-500 text-white text-[11px] font-bold rounded-full ml-0.5"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search input */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="mobile-search-input"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'shop') setActiveTab('shop');
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border border-transparent focus:border-slate-300 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>
    </header>
  );
};
