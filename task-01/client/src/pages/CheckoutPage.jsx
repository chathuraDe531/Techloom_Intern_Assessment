import React, { useState } from 'react';
import { ShieldCheck, Clock, ArrowLeft, CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';
import CheckoutSteps from '../components/CheckoutSteps';
import { getProductImage } from '../utils/productImages';
import { api } from '../services/api';

const formatLKR = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CheckoutPage({
  cart,
  onBackToCart,
  onOrderCreated,
  showToast,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => `checkout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleStartCheckout = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        idempotencyKey,
      };

      const response = await api.createOrder(payload);
      showToast('Stock atomically reserved! Order created.', 'success');
      onOrderCreated(response.data.order, response.data.reservation);
    } catch (err) {
      const msg = err.message || 'Failed to reserve stock & checkout';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <CheckoutSteps currentStep="checkout" />

      <div className="mb-4">
        <button className="btn-secondary btn-sm" onClick={onBackToCart}>
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </button>
      </div>

      <div className="card checkout-card">
        <div className="card-header-with-badge mb-4">
          <div>
            <h2 className="card-title text-2xl">Confirm & Reserve Order</h2>
            <p className="text-muted">
              Locking your items guarantees no other shopper can purchase them while you complete payment.
            </p>
          </div>
          <span className="badge badge-reserved">
            <Lock size={12} className="inline mr-1" />
            Stock Lock Ready
          </span>
        </div>

        {/* Items review */}
        <div className="checkout-items-box mb-6">
          <h4 className="section-label mb-3">Order Items ({cart.length})</h4>
          <div className="checkout-items-table">
            {cart.map((item) => {
              const imageUrl = getProductImage(item.name);
              return (
                <div key={item.productId} className="checkout-item-row">
                  <div className="checkout-item-left">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="checkout-thumb"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80';
                      }}
                    />
                    <div className="checkout-item-detail">
                      <span className="item-name font-medium">{item.name}</span>
                      <span className="text-xs text-muted">
                        Qty: {item.quantity} × {formatLKR(item.price)}
                      </span>
                    </div>
                  </div>
                  <div className="checkout-item-pricing font-mono font-semibold">
                    {formatLKR(item.price * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="checkout-summary-block mt-4 pt-4 border-t">
            <div className="summary-row text-sm">
              <span className="text-muted">Items Subtotal:</span>
              <span>{formatLKR(subtotal)}</span>
            </div>
            <div className="summary-row text-sm mt-1">
              <span className="text-muted">Simulated Tax (8%):</span>
              <span>{formatLKR(tax)}</span>
            </div>
            <div className="summary-row summary-total mt-2 pt-2 border-t">
              <span className="font-bold text-lg">Total Amount:</span>
              <span className="checkout-total-amount font-mono font-bold text-2xl text-primary">
                {formatLKR(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Informational callout about concurrency safety and 5-min reservation */}
        <div className="info-callout mb-6">
          <div className="callout-item">
            <Clock size={22} className="text-warning flex-shrink-0" />
            <div>
              <strong>Atomic 5-Minute Reservation Guarantee</strong>
              <p className="text-sm text-muted mt-1">
                Upon clicking the button below, inventory is atomically locked for your session.
                You have a full 5 minutes to simulate or process payment. If unfulfilled, stock is automatically returned to the public store.
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-reserve-checkout"
          className="btn-primary btn-block btn-lg"
          onClick={handleStartCheckout}
          disabled={submitting || cart.length === 0}
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="spin" />
              <span>Acquiring Atomic Inventory Lock...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={20} />
              <span>Reserve Stock & Proceed to Payment</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
