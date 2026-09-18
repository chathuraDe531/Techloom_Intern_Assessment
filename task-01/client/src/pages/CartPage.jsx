import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import CheckoutSteps from '../components/CheckoutSteps';
import { getProductImage } from '../utils/productImages';

const formatLKR = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CartPage({
  cart,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping,
}) {
  const productMap = products.reduce((acc, p) => {
    acc[p._id] = p;
    return acc;
  }, {});

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% simulated tax
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="page-container">
        <CheckoutSteps currentStep="cart" />
        <div className="empty-state card text-center py-12">
          <div className="empty-cart-circle">
            <ShoppingBag size={52} className="text-muted" />
          </div>
          <h2 className="text-2xl font-bold mt-4">Your Cart is Empty</h2>
          <p className="text-muted max-w-md mx-auto mb-6 mt-2">
            You haven't added any products to your cart yet. Explore our store catalog and discover great items!
          </p>
          <button className="btn-primary btn-lg" onClick={onContinueShopping}>
            <ArrowLeft size={18} />
            <span>Browse Products</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <CheckoutSteps currentStep="cart" />

      <div className="page-header">
        <div>
          <h1 className="page-title">Review Shopping Cart</h1>
          <p className="page-subtitle">
            Verify your selected items and quantities before locking your reservation.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary btn-sm" onClick={onContinueShopping}>
            <ArrowLeft size={15} />
            <span>Keep Shopping</span>
          </button>
          <button className="btn-outline-danger btn-sm" onClick={onClearCart}>
            <Trash2 size={15} />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      <div className="cart-grid">
        {/* Left Column: Cart Items List */}
        <div className="cart-items-section card">
          <div className="cart-items-header">
            <span>Items in Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>Price & Subtotal</span>
          </div>

          <div className="cart-items-list">
            {cart.map((item) => {
              const liveProduct = productMap[item.productId];
              const availableStock = liveProduct ? liveProduct.availableStock : 0;
              const hasInsufficientStock = item.quantity > availableStock;
              const imageUrl = getProductImage(item.name);

              return (
                <div key={item.productId} className="cart-item-row">
                  {/* Thumbnail */}
                  <div className="cart-item-thumb-wrapper">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="cart-item-thumb"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-meta">
                      <span className="unit-price">{formatLKR(item.price)} each</span>
                      <span className="dot-sep">•</span>
                      <span className={`stock-indicator ${hasInsufficientStock ? 'text-danger font-bold' : 'text-muted'}`}>
                        {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock!'}
                      </span>
                    </div>

                    {hasInsufficientStock && (
                      <p className="error-stock-notice">
                        ⚠️ Attention: Requested {item.quantity}, but only {availableStock} available in inventory!
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="cart-qty-controls">
                    <button
                      id={`decrease-qty-${item.productId}`}
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      title="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      id={`increase-qty-${item.productId}`}
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= availableStock}
                      title="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="cart-item-subtotal">
                    <span className="subtotal-amount">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    id={`remove-item-${item.productId}`}
                    className="btn-icon btn-icon-danger"
                    title="Remove item"
                    onClick={() => onRemoveItem(item.productId)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Trigger */}
        <div className="cart-summary-section">
          <div className="card summary-card">
            <h3 className="card-title">Order Summary</h3>

            <div className="summary-breakdown">
              <div className="summary-row">
                <span className="text-muted">Subtotal ({cart.length} unique items)</span>
                <span className="font-medium">{formatLKR(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Estimated Tax (8%)</span>
                <span className="font-medium">{formatLKR(tax)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span className="total-label">Estimated Total</span>
                <span className="total-value text-primary">{formatLKR(total)}</span>
              </div>
            </div>

            <div className="reservation-notice-box">
              <div className="notice-icon">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <div>
                <strong>Atomic Inventory Guarantee</strong>
                <p>
                  Proceeding to checkout holds inventory exclusively for you for 5 minutes with automatic release on timeout.
                </p>
              </div>
            </div>

            <button
              id="btn-proceed-to-checkout"
              className="btn-primary btn-block btn-lg mt-4"
              onClick={onProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
