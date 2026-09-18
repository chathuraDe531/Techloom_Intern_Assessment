import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  ArrowRight,
  ShieldAlert,
  Receipt,
  Sparkles,
} from 'lucide-react';
import CheckoutSteps from '../components/CheckoutSteps';
import { api } from '../services/api';

const formatLKR = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OrderResultPage({
  order,
  payment,
  onReturnToStore,
  onRefreshOrder,
  showToast,
}) {
  const [testingDuplicate, setTestingDuplicate] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="badge badge-paid">PAID</span>;
      case 'RESERVED':
        return <span className="badge badge-reserved">RESERVED</span>;
      case 'FAILED':
        return <span className="badge badge-failed">FAILED</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">CANCELLED</span>;
      case 'EXPIRED':
        return <span className="badge badge-expired">EXPIRED</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getResultIcon = () => {
    if (order.status === 'PAID') {
      return (
        <div className="result-icon-wrapper bg-success-light text-success">
          <CheckCircle2 size={52} />
        </div>
      );
    }
    if (order.status === 'FAILED') {
      return (
        <div className="result-icon-wrapper bg-danger-light text-danger">
          <XCircle size={52} />
        </div>
      );
    }
    if (order.status === 'CANCELLED') {
      return (
        <div className="result-icon-wrapper bg-slate-light text-muted">
          <Ban size={52} />
        </div>
      );
    }
    if (order.status === 'EXPIRED') {
      return (
        <div className="result-icon-wrapper bg-rose-light text-danger">
          <Clock size={52} />
        </div>
      );
    }
    return (
      <div className="result-icon-wrapper bg-warning-light text-warning">
        <Clock size={52} />
      </div>
    );
  };

  const handleTestDuplicatePayment = async () => {
    try {
      setTestingDuplicate(true);
      await api.simulatePayment({
        orderId: order._id || order.orderId,
        outcome: 'SUCCESS',
      });
      showToast('Unexpected: Duplicate payment was permitted!', 'error');
    } catch (err) {
      showToast(`Duplicate payment successfully blocked: ${err.message}`, 'success');
    } finally {
      setTestingDuplicate(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(true);
      const res = await api.cancelOrder(order._id || order.orderId);
      showToast(res.message, 'info');
      onRefreshOrder(res.data.order);
    } catch (err) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <CheckoutSteps currentStep="result" />

      <div className="card result-card text-center">
        {getResultIcon()}

        <h2 className="result-title text-2xl font-bold mt-4">
          {order.status === 'PAID'
            ? 'Order Confirmed & Payment Successful!'
            : order.status === 'FAILED'
            ? 'Payment Simulation Failed'
            : order.status === 'CANCELLED'
            ? 'Order Cancelled'
            : order.status === 'EXPIRED'
            ? 'Stock Reservation Expired'
            : 'Payment Timed Out'}
        </h2>

        <p className="result-desc text-muted mt-2 max-w-md mx-auto">
          {order.status === 'PAID'
            ? 'Your payment was approved! Reserved stock has been permanently deducted in the inventory.'
            : order.status === 'FAILED'
            ? 'The simulated payment was declined. Inventory stock was immediately unlocked and returned to the store catalog.'
            : order.status === 'CANCELLED'
            ? 'This order was cancelled and any held stock has been restored to inventory.'
            : order.status === 'EXPIRED'
            ? 'The 5-minute stock hold elapsed without payment. Items were released back to the store.'
            : 'Payment timed out. Stock remains reserved until the 5-minute timer expires.'}
        </p>

        {/* Order Details Grid */}
        <div className="result-details-box mt-6 text-left">
          <div className="result-detail-row">
            <span className="text-muted">Order ID:</span>
            <span className="font-mono font-bold text-main">{order.orderId}</span>
          </div>

          <div className="result-detail-row">
            <span className="text-muted">Order Status:</span>
            <span>{getStatusBadge(order.status)}</span>
          </div>

          <div className="result-detail-row">
            <span className="text-muted">Payment Status:</span>
            <span className="font-semibold">{order.paymentStatus || 'PENDING'}</span>
          </div>

          {payment && (
            <div className="result-detail-row">
              <span className="text-muted">Transaction ID:</span>
              <span className="font-mono text-xs">{payment.transactionId}</span>
            </div>
          )}

          <div className="result-detail-row pt-2 border-t font-semibold">
            <span className="text-lg">Total Amount:</span>
            <span className="font-mono text-xl text-primary font-bold">
              {formatLKR(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Items list */}
        <div className="order-items-receipt mt-4 text-left">
          <div className="receipt-header">
            <Receipt size={16} />
            <span>Purchased Items Receipt</span>
          </div>
          <div className="receipt-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="receipt-item-row">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span className="font-mono font-medium">{formatLKR(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Concurrency & Duplicate Protection Demonstration */}
        <div className="duplicate-protection-card mt-6 text-left">
          <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
            <ShieldAlert size={16} className="text-primary" />
            <span>Duplicate Payment Protection Check</span>
          </div>
          <p className="text-xs text-muted mb-3">
            Testing Requirement 8: Submitting a secondary charge against this order will be automatically blocked by the atomic guard.
          </p>
          <button
            id="btn-test-duplicate-payment"
            className="btn-secondary btn-sm"
            onClick={handleTestDuplicatePayment}
            disabled={testingDuplicate || order.status !== 'PAID'}
          >
            {testingDuplicate ? 'Testing...' : 'Test Duplicate Payment Protection'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="result-actions mt-6 flex-center gap-3">
          {order.status === 'PAID' && (
            <button
              id="btn-cancel-paid-order"
              className="btn-outline-danger btn-sm"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              Cancel Order (Simulate Refund)
            </button>
          )}

          <button
            id="btn-back-to-store"
            className="btn-primary"
            onClick={onReturnToStore}
          >
            <span>Return to Store Catalog</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
