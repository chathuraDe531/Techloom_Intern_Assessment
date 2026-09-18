import React, { useState } from 'react';
import { Order } from '../types.js';
import { api } from '../api.js';
import { 
  Package, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Receipt
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  onOrderUpdated: () => void;
  onNavigateToShop: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOrderUpdated,
  onNavigateToShop,
}) => {
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleCancelAndRefund = async (orderId: string) => {
    setCancellingOrderId(orderId);
    setCancelError(null);

    try {
      await api.cancelOrder(orderId, 'Customer requested return and refund');
      setConfirmCancelId(null);
      onOrderUpdated();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-600" />
            <span>Order History & Post-Purchase Status</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track order fulfillment, payment receipts, audit timelines, and test automated refund simulation.
          </p>
        </div>

        <button
          onClick={onNavigateToShop}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shop More Items</span>
        </button>
      </div>

      {cancelError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto">
          <Receipt className="w-16 h-16 text-slate-300 stroke-1 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-base mb-1">No Orders Found Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            When you complete a checkout session, your order records, payment receipts, and timeline events will appear here.
          </p>
          <button
            onClick={onNavigateToShop}
            className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrders[order.id] !== false; // default open
            const isPaid = order.status === 'PAID';
            const isRefunded = order.status === 'REFUNDED';
            const isCancelling = cancellingOrderId === order.id;
            const isConfirming = confirmCancelId === order.id;

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                {/* Order Card Header */}
                <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Order Number
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {order.id}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Date Placed
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Amount
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Expand Toggle */}
                  <div className="flex items-center gap-3">
                    {isPaid && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Paid & Confirmed
                      </span>
                    )}

                    {isRefunded && (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Cancelled & Refunded
                      </span>
                    )}

                    {order.status === 'CANCELLED' && !isRefunded && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold">
                        Cancelled
                      </span>
                    )}

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6">
                    
                    {/* Items Purchased */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                        Ordered Items
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-slate-200/60"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-slate-900 text-xs truncate">
                                {item.name}
                              </h5>
                              <div className="text-[11px] text-slate-500">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="font-bold text-slate-900 text-xs">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Grid: Payment Details & Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* Payment Card Box */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Payment Transaction Record</span>
                        </div>
                        <div className="text-slate-600 space-y-1 text-[11px]">
                          <div>Method: {order.payment.method} (•••• {order.payment.last4})</div>
                          <div className="font-mono">Tx ID: {order.payment.transactionId}</div>
                          {order.payment.refundId && (
                            <div className="text-purple-700 font-semibold font-mono bg-purple-50 p-1.5 rounded border border-purple-200 mt-1">
                              Refund ID: {order.payment.refundId} (${order.payment.refundAmount?.toFixed(2)})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Recipient & Shipping Destination</span>
                        </div>
                        <div className="text-slate-600 text-[11px] space-y-0.5">
                          <div className="font-semibold text-slate-800">{order.customer.name}</div>
                          <div>{order.customer.street}</div>
                          <div>
                            {order.customer.city}, {order.customer.state} {order.customer.zipCode}
                          </div>
                          <div className="text-slate-400">{order.customer.email}</div>
                        </div>
                      </div>

                    </div>

                    {/* Order Audit Timeline */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Audit Event Timeline</span>
                      </h4>
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {order.timeline.map((event, idx) => (
                          <div key={idx} className="relative text-xs">
                            <div
                              className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                                event.type === 'success'
                                  ? 'bg-emerald-500'
                                  : event.type === 'warning'
                                  ? 'bg-purple-500'
                                  : 'bg-indigo-500'
                              }`}
                            />
                            <div className="font-bold text-slate-800">{event.title}</div>
                            <div className="text-slate-600 text-[11px] leading-relaxed">
                              {event.description}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cancellation & Refund Action Panel */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="text-xs text-slate-500">
                        {isPaid && (
                          <span>
                            Eligible for instant automated cancellation and full card refund.
                          </span>
                        )}
                        {isRefunded && (
                          <span className="text-purple-700 font-medium">
                            Full refund completed. Stock items were replenished back to store inventory.
                          </span>
                        )}
                      </div>

                      {isPaid && (
                        <div>
                          {isConfirming ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600 font-medium">
                                Confirm full refund of ${order.total.toFixed(2)}?
                              </span>
                              <button
                                id={`confirm-cancel-btn-${order.id}`}
                                onClick={() => handleCancelAndRefund(order.id)}
                                disabled={isCancelling}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                              >
                                {isCancelling ? 'Processing Refund...' : 'Yes, Cancel & Refund'}
                              </button>
                              <button
                                onClick={() => setConfirmCancelId(null)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Abort
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`cancel-order-btn-${order.id}`}
                              onClick={() => setConfirmCancelId(order.id)}
                              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Cancel Order & Simulate Refund</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
