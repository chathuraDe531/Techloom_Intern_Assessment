import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Ban, ArrowLeft, CreditCard, QrCode, DollarSign, ShieldCheck } from 'lucide-react';
import ReservationTimer from '../components/ReservationTimer';
import CheckoutSteps from '../components/CheckoutSteps';
import { api } from '../services/api';

const formatLKR = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PaymentPage({
  order,
  reservation,
  onPaymentComplete,
  onCancelOrder,
  onReturnToStore,
  showToast,
}) {
  const [processing, setProcessing] = useState(false);
  const [isExpiredLocally, setIsExpiredLocally] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');

  const expiresAt = reservation ? reservation.expiresAt : order.reservationId?.expiresAt;

  const handleSimulatePayment = async (outcome) => {
    if (processing) return;

    try {
      setProcessing(true);
      const res = await api.simulatePayment({
        orderId: order._id || order.orderId,
        outcome,
      });

      showToast(res.message, outcome === 'SUCCESS' ? 'success' : outcome === 'FAILED' ? 'error' : 'info');
      onPaymentComplete(res.data.order, res.data.payment, outcome);
    } catch (err) {
      const errorMsg = err.message || 'Payment simulation failed';
      showToast(errorMsg, 'error');
      if (errorMsg.toLowerCase().includes('expired')) {
        setIsExpiredLocally(true);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelClick = async () => {
    if (!window.confirm('Are you sure you want to cancel this order and release the reserved stock?')) {
      return;
    }

    try {
      setProcessing(true);
      const res = await api.cancelOrder(order._id || order.orderId);
      showToast(res.message, 'info');
      onCancelOrder(res.data.order);
    } catch (err) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <CheckoutSteps currentStep="payment" />

      <div className="mb-4 flex-between">
        <button className="btn-secondary btn-sm" onClick={onReturnToStore}>
          <ArrowLeft size={16} />
          <span>Exit to Products</span>
        </button>
        <span className="badge badge-reserved font-mono">
          Order: {order.orderId}
        </span>
      </div>

      {/* 5-Minute Reservation Live Timer */}
      {expiresAt && (
        <ReservationTimer
          expiresAt={expiresAt}
          onExpire={() => {
            setIsExpiredLocally(true);
            showToast('The 5-minute stock reservation window has expired!', 'error');
          }}
        />
      )}

      <div className="card payment-card mt-4">
        <div className="card-header-with-badge mb-4">
          <div>
            <h2 className="card-title text-2xl">Payment Gateway Simulator</h2>
            <p className="text-muted">
              Select your payment method and choose a simulation outcome to test real-time stock transitions.
            </p>
          </div>
          <span className="badge badge-reserved">Awaiting Payment</span>
        </div>

        {/* Order Details Breakdown */}
        <div className="order-summary-box mb-6">
          <div className="flex-between mb-2">
            <span className="text-muted">Order ID:</span>
            <strong className="font-mono text-main">{order.orderId}</strong>
          </div>
          <div className="flex-between mb-2">
            <span className="text-muted">Reserved Items:</span>
            <span className="font-medium">{order.items?.length || 0} product(s)</span>
          </div>
          <div className="flex-between mb-2 pt-2 border-t">
            <span className="font-bold text-lg">Total Amount Due:</span>
            <span className="font-mono font-bold text-2xl text-primary">
              {formatLKR(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Payment Methods Selector (Visual Realism) */}
        <div className="payment-methods-tabs mb-6">
          <h4 className="section-label mb-3">Preferred Payment Method:</h4>
          <div className="method-pill-group">
            <button
              className={`method-pill ${selectedMethod === 'card' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <CreditCard size={18} />
              <span>Credit / Debit Card</span>
            </button>
            <button
              className={`method-pill ${selectedMethod === 'lankaqr' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('lankaqr')}
            >
              <QrCode size={18} />
              <span>LankaQR / FriMi / Genie</span>
            </button>
            <button
              className={`method-pill ${selectedMethod === 'cash' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('cash')}
            >
              <DollarSign size={18} />
              <span>POS Terminal / Cash</span>
            </button>
          </div>
        </div>

        {/* Required 3 Payment Simulation Buttons */}
        <div className="payment-simulation-actions">
          <h4 className="section-label mb-3">Trigger Payment Outcome:</h4>

          <div className="simulation-buttons-grid">
            {/* Button 1: Pay Successfully */}
            <button
              id="btn-pay-success"
              className="btn-outcome btn-outcome-success"
              disabled={processing || isExpiredLocally}
              onClick={() => handleSimulatePayment('SUCCESS')}
            >
              <CheckCircle2 size={24} className="outcome-icon" />
              <div className="outcome-text">
                <span className="outcome-title">Authorize &amp; Pay (Success)</span>
                <span className="outcome-desc">
                  Status → PAID • Stock permanently consumed • Reservation converted
                </span>
              </div>
            </button>

            {/* Button 2: Simulate Payment Failure */}
            <button
              id="btn-pay-failed"
              className="btn-outcome btn-outcome-danger"
              disabled={processing || isExpiredLocally}
              onClick={() => handleSimulatePayment('FAILED')}
            >
              <XCircle size={24} className="outcome-icon" />
              <div className="outcome-text">
                <span className="outcome-title">Simulate Card Declined (Failure)</span>
                <span className="outcome-desc">
                  Status → FAILED • Stock returned to store immediately • Reservation released
                </span>
              </div>
            </button>

            {/* Button 3: Simulate Payment Timeout */}
            <button
              id="btn-pay-timeout"
              className="btn-outcome btn-outcome-warning"
              disabled={processing || isExpiredLocally}
              onClick={() => handleSimulatePayment('TIMEOUT')}
            >
              <Clock size={24} className="outcome-icon" />
              <div className="outcome-text">
                <span className="outcome-title">Simulate Network Timeout</span>
                <span className="outcome-desc">
                  Status → TIMEOUT • Stock kept locked until 5-min timer auto-expires
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Cancellation Option */}
        <div className="payment-footer-actions mt-6 pt-4 border-t flex-between">
          <button
            id="btn-cancel-order"
            className="btn-outline-danger btn-sm"
            disabled={processing}
            onClick={handleCancelClick}
          >
            <Ban size={16} />
            <span>Cancel Order &amp; Release Stock</span>
          </button>

          <span className="text-xs text-muted flex items-center gap-1">
            <ShieldCheck size={14} className="text-success inline" />
            Idempotency &amp; race-condition protected
          </span>
        </div>
      </div>
    </div>
  );
}
