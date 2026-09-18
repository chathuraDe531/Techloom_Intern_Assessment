import React from 'react';
import { Order } from '../types.js';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  transactionId: string;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  transactionId,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        id="order-success-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 inline-block mb-2">
          Payment Authorized & Captured
        </span>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
          Order Confirmed!
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Thank you, <strong className="text-slate-800">{order.customer.name}</strong>. Your payment was safely processed and the inventory reservation has been permanently committed.
        </p>

        {/* Order Details Receipt Box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-left text-xs mb-6 space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Order Reference</span>
            <span className="font-mono font-bold text-slate-900">{order.id}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Payment TxID</span>
            <span className="font-mono text-slate-700">{transactionId || order.payment.transactionId}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Total Paid</span>
            <span className="font-extrabold text-slate-900 text-sm">${order.total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Shipping To</span>
            <span className="text-slate-700 font-medium truncate max-w-[200px]">
              {order.customer.city}, {order.customer.state}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            id="view-in-orders-btn"
            onClick={onViewOrders}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 group"
          >
            <Package className="w-4 h-4" />
            <span>View in Order History & Test Refund</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="continue-shopping-btn"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Stock reservation successfully committed to warehouse database</span>
        </div>
      </div>
    </div>
  );
};
