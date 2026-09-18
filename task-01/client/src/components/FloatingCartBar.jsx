import React from 'react';
import { ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react';

export const formatLKR = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FloatingCartBar({ cart, onOpenCart, onProceedToCheckout }) {
  if (!cart || cart.length === 0) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="floating-cart-bar-wrapper">
      <div className="floating-cart-bar">
        <div className="floating-cart-info" onClick={onOpenCart}>
          <div className="floating-cart-icon-wrap">
            <ShoppingCart size={20} />
            <span className="floating-cart-badge">{totalItems}</span>
          </div>
          <div className="floating-cart-text">
            <span className="floating-cart-title">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in Cart
            </span>
            <span className="floating-cart-total">{formatLKR(totalAmount)}</span>
          </div>
        </div>

        <div className="floating-cart-actions">
          <button className="btn-secondary btn-sm" onClick={onOpenCart}>
            View Cart
          </button>
          <button
            id="floating-checkout-btn"
            className="btn-primary btn-sm floating-checkout-action"
            onClick={onProceedToCheckout}
          >
            <ShieldCheck size={16} />
            <span>Checkout</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
