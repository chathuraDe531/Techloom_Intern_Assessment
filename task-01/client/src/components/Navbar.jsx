import React from 'react';
import { ShoppingBag, ShoppingCart, Layers, Package, CreditCard, ShieldCheck } from 'lucide-react';

const formatLKR = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Navbar({ activeTab, setActiveTab, cartItemCount, cartTotalAmount = 0 }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab('products')}>
          <div className="brand-icon">
            <Package size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Techloom POS</span>
            <span className="brand-subtitle">Real-Time Concurrency Inventory</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            id="nav-products-btn"
            className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={18} />
            <span>Store</span>
          </button>

          <button
            id="nav-management-btn"
            className={`nav-btn ${activeTab === 'management' ? 'active' : ''}`}
            onClick={() => setActiveTab('management')}
          >
            <Layers size={18} />
            <span>Inventory</span>
          </button>

          <button
            id="nav-cart-btn"
            className={`nav-btn cart-nav-btn ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="cart-count-badge animate-scale-up">{cartItemCount}</span>
            )}
            {cartTotalAmount > 0 && (
              <span className="nav-cart-amount-tag font-mono">
                {formatLKR(cartTotalAmount)}
              </span>
            )}
          </button>

          {/* Quick Checkout Shortcut */}
          {cartItemCount > 0 && (
            <button
              id="nav-checkout-btn"
              className={`nav-btn nav-btn-checkout ${activeTab === 'checkout' ? 'active' : ''}`}
              onClick={() => setActiveTab('checkout')}
            >
              <CreditCard size={18} />
              <span>Checkout</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
