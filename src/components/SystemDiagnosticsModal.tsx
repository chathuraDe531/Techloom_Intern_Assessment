import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { InventoryAuditLog } from '../types.js';
import { Activity, X, RefreshCw, Layers, ShieldCheck, Database, RotateCcw } from 'lucide-react';

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreReset: () => void;
}

export const SystemDiagnosticsModal: React.FC<SystemDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onStoreReset,
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<InventoryAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadDiagnostics = async () => {
    setIsLoading(true);
    try {
      const [m, logs] = await Promise.all([api.getMetrics(), api.getAuditLogs()]);
      setMetrics(m);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load system diagnostics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDiagnostics();
    }
  }, [isOpen]);

  const handleReset = async () => {
    if (!confirm('Reset all catalog stock, orders, and reservations to factory baseline?')) return;
    setIsResetting(true);
    try {
      await api.resetSystem();
      await loadDiagnostics();
      onStoreReset();
    } finally {
      setIsResetting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        id="system-diagnostics-modal"
        className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                System Diagnostics & Live Stock Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Server-side audit trail tracking stock reservation leases, commitments, and refund restoration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDiagnostics}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Warehouse Stock Units
              </span>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {metrics.totalInventoryUnits}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Active Leased Stock
              </span>
              <div className="text-xl font-black text-amber-900 mt-0.5">
                {metrics.totalReservedUnits} <span className="text-xs font-medium">units</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Paid Orders
              </span>
              <div className="text-xl font-black text-emerald-900 mt-0.5">
                {metrics.paidOrdersCount}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/70">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                Refunded Orders
              </span>
              <div className="text-xl font-black text-purple-900 mt-0.5">
                {metrics.refundedOrdersCount}
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Stream */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Stock Event Stream ({auditLogs.length} events recorded)
            </span>
            <span className="text-[11px] text-slate-400">Auto-sweeps expired leases every 3s</span>
          </div>

          <div className="flex-1 overflow-y-auto border border-slate-200/80 rounded-2xl divide-y divide-slate-100 bg-slate-50/50">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No inventory events recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => {
                const isReserve = log.action === 'RESERVED';
                const isCommit = log.action === 'COMMITTED';
                const isRestored = log.action === 'RESTORED_REFUND';
                const isExpired = log.action === 'RELEASED_EXPIRY';

                return (
                  <div key={log.id} className="p-3 text-xs flex items-start justify-between gap-3 hover:bg-white transition-colors">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide shrink-0 ${
                          isReserve
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : isCommit
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : isRestored
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : isExpired
                            ? 'bg-red-100 text-red-900 border border-red-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.action}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {log.productName}
                        </div>
                        <div className="text-slate-500 text-[11px]">{log.reason}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-slate-700 font-bold text-[11px]">
                        {log.action === 'RESTORED_REFUND' ? `+${log.quantity}` : log.action === 'COMMITTED' ? `-${log.quantity}` : `${log.quantity} units`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>State synchronized across all client tabs</span>
          </div>

          <button
            id="reset-system-state-btn"
            onClick={handleReset}
            disabled={isResetting}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 hover:border-red-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isResetting ? 'Resetting Store...' : 'Reset Demo Inventory'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
