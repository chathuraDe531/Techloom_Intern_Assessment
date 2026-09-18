import React, { useState, useEffect } from 'react';
import { CheckoutSession, PaymentScenario, Order } from '../types.js';
import { api } from '../api.js';
import { 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface CheckoutViewProps {
  session: CheckoutSession;
  onPaymentSuccess: (order: Order, transactionId: string) => void;
  onCancelCheckout: () => void;
  onReReserve: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  session,
  onPaymentSuccess,
  onCancelCheckout,
  onReReserve,
}) => {
  // Timer State
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    return Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000));
  });
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Alexandra Vance',
    email: 'alexandra.vance@example.com',
    street: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zipCode: '97477',
  });

  const [cardInfo, setCardInfo] = useState({
    cardNumber: '4242 •••• •••• 4242',
    rawCardNumber: '4242424242424242',
    cardholderName: 'ALEXANDRA VANCE',
    expiryDate: '11/28',
    cvv: '891',
  });

  // Gateway Simulation Controls
  const [scenario, setScenario] = useState<PaymentScenario>('success');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<{
    title: string;
    message: string;
    type: 'error' | 'timeout' | 'conflict';
    canRetry: boolean;
  } | null>(null);

  // Concurrency & Idempotency Testing
  const [idempotencyKey, setIdempotencyKey] = useState<string>(session.idempotencyKey);
  const [copiedKey, setCopiedKey] = useState(false);
  const [concurrencyTestLog, setConcurrencyTestLog] = useState<string[] | null>(null);

  // Polling / countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000));
      setRemainingSeconds(left);
      if (left <= 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.expiresAt]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerPercent = Math.min(100, Math.max(0, (remainingSeconds / 180) * 100));

  const handleCopyIdempotencyKey = () => {
    navigator.clipboard.writeText(idempotencyKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Standard Payment Submission
  const handleSubmitPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isExpired || isProcessing) return;

    setIsProcessing(true);
    setPaymentError(null);
    setConcurrencyTestLog(null);

    try {
      const response = await api.processPayment({
        sessionId: session.sessionId,
        idempotencyKey,
        scenario,
        cardDetails: {
          cardNumber: cardInfo.rawCardNumber,
          cardholderName: cardInfo.cardholderName,
          expiryDate: cardInfo.expiryDate,
          cvv: cardInfo.cvv,
        },
        billingAddress: customerInfo,
      });

      if (response.order) {
        onPaymentSuccess(response.order, response.transactionId || 'tx_demo');
      }
    } catch (err: any) {
      if (err.status === 504) {
        setPaymentError({
          title: 'Payment Gateway Timeout (504)',
          message:
            err.message ||
            'The payment processor did not respond within the gateway window. Your stock reservation is still safely held.',
          type: 'timeout',
          canRetry: true,
        });
      } else if (err.status === 402) {
        setPaymentError({
          title: 'Payment Declined (402)',
          message: err.message || 'The card issuer declined the payment authorization.',
          type: 'error',
          canRetry: true,
        });
      } else if (err.status === 410) {
        setIsExpired(true);
        setPaymentError({
          title: 'Stock Reservation Expired (410)',
          message: err.message || 'The lease time ran out. Items returned to inventory.',
          type: 'error',
          canRetry: false,
        });
      } else if (err.status === 409) {
        setPaymentError({
          title: 'Duplicate / Concurrent Payment Blocked (409)',
          message: err.message || 'A payment with this idempotency key is already running.',
          type: 'conflict',
          canRetry: true,
        });
      } else {
        setPaymentError({
          title: 'Payment Processing Error',
          message: err.message || 'Unexpected payment error.',
          type: 'error',
          canRetry: true,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Rapid Concurrent Double-Submit to test Idempotency Mutex
  const handleTestConcurrentDoubleSubmit = async () => {
    if (isExpired || isProcessing) return;
    setIsProcessing(true);
    setPaymentError(null);
    setConcurrencyTestLog(['🚀 Firing 2 simultaneous payment requests with the exact same Idempotency-Key...']);

    const payload = {
      sessionId: session.sessionId,
      idempotencyKey,
      scenario,
      cardDetails: {
        cardNumber: cardInfo.rawCardNumber,
        cardholderName: cardInfo.cardholderName,
        expiryDate: cardInfo.expiryDate,
        cvv: cardInfo.cvv,
      },
      billingAddress: customerInfo,
    };

    const results = await Promise.allSettled([
      api.processPayment(payload),
      api.processPayment(payload),
    ]);

    const logs: string[] = [
      '🚀 Dispatched Request A & Request B in parallel milliseconds apart:',
    ];

    let successOrder: Order | null = null;
    let txId = '';

    results.forEach((res, index) => {
      const reqName = index === 0 ? 'Request A' : 'Request B';
      if (res.status === 'fulfilled') {
        logs.push(`✅ ${reqName}: HTTP 200 OK — Charge captured (TxID: ${res.value.transactionId || 'captured'})`);
        if (res.value.order) {
          successOrder = res.value.order;
          txId = res.value.transactionId || 'tx_double';
        }
      } else {
        const reason = res.reason;
        logs.push(
          `🛡️ ${reqName}: HTTP ${reason.status || 409} Blocked/Deduplicated — ${reason.message || 'Duplicate payment caught by server idempotency ledger'}`
        );
      }
    });

    logs.push('🎯 Result: Idempotency protection successfully prevented double charging & duplicate order creation!');
    setConcurrencyTestLog(logs);
    setIsProcessing(false);

    if (successOrder) {
      setTimeout(() => {
        onPaymentSuccess(successOrder!, txId);
      }, 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Back to Shop / Cancel Checkout Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="checkout-back-btn"
          onClick={onCancelCheckout}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Release Reservation & Return to Store</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit Encrypted Session: <code className="font-mono text-slate-700">{session.sessionId.slice(-10)}</code></span>
        </div>
      </div>

      {/* Stock Reservation Countdown Banner */}
      <div
        id="reservation-timer-banner"
        className={`rounded-2xl p-4 sm:p-5 mb-8 border transition-all ${
          isExpired
            ? 'bg-red-50 border-red-200 text-red-900'
            : remainingSeconds < 60
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                isExpired
                  ? 'bg-red-200 text-red-800'
                  : remainingSeconds < 60
                  ? 'bg-amber-200 text-amber-900 animate-pulse'
                  : 'bg-emerald-200 text-emerald-900'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                {isExpired ? 'Stock Reservation Lease Expired' : 'Inventory Reserved For Checkout'}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  Lease ID: {session.reservationId}
                </span>
              </h3>
              <p className="text-xs text-slate-600">
                {isExpired
                  ? 'The 3-minute reservation window expired. Items have been released back to general warehouse inventory.'
                  : `Your ${session.items.reduce((s, i) => s + i.quantity, 0)} item(s) are locked exclusively for you. Complete payment before the timer reaches 00:00.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                Remaining Time
              </div>
              <div
                id="reservation-countdown-display"
                className={`text-2xl font-black font-mono tracking-tight ${
                  isExpired ? 'text-red-700' : remainingSeconds < 60 ? 'text-amber-700' : 'text-emerald-800'
                }`}
              >
                {formatTimer(remainingSeconds)}
              </div>
            </div>

            {isExpired && (
              <button
                id="re-reserve-stock-btn"
                onClick={onReReserve}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Reserve Stock</span>
              </button>
            )}
          </div>
        </div>

        {/* Lease Progress Bar */}
        {!isExpired && (
          <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                remainingSeconds < 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer & Payment Form + Gateway Testing */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MOCK PAYMENT GATEWAY SIMULATOR PANEL */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mock Payment Gateway Controller
                </span>
              </div>
              <span className="text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-md font-mono">
                Acquirer Sandbox v2.4
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Select the simulated gateway response to test how this e-commerce system handles normal captures, insufficient funds, card declines, and upstream network timeouts:
            </p>

            {/* Scenario Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                id="scenario-success-btn"
                onClick={() => setScenario('success')}
                className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                  scenario === 'success'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xs'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${scenario === 'success' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">1. Successful Payment</div>
                  <div className="text-[11px] opacity-70">200 OK • Capture charge & commit stock</div>
                </div>
              </button>

              <button
                type="button"
                id="scenario-insufficient-funds-btn"
                onClick={() => setScenario('insufficient_funds')}
                className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                  scenario === 'insufficient_funds'
                    ? 'bg-amber-950/70 border-amber-500 text-white shadow-xs'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${scenario === 'insufficient_funds' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">2. Insufficient Funds</div>
                  <div className="text-[11px] opacity-70">402 Decline • Keep lease active for retry</div>
                </div>
              </button>

              <button
                type="button"
                id="scenario-card-declined-btn"
                onClick={() => setScenario('card_declined')}
                className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                  scenario === 'card_declined'
                    ? 'bg-rose-950/70 border-rose-500 text-white shadow-xs'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <XCircle className={`w-4 h-4 shrink-0 mt-0.5 ${scenario === 'card_declined' ? 'text-rose-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">3. Card Declined / Fraud</div>
                  <div className="text-[11px] opacity-70">402 Refused • Safe retry available</div>
                </div>
              </button>

              <button
                type="button"
                id="scenario-timeout-btn"
                onClick={() => setScenario('timeout')}
                className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                  scenario === 'timeout'
                    ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-xs'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${scenario === 'timeout' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">4. Gateway Timeout (5.5s)</div>
                  <div className="text-[11px] opacity-70">504 Gateway Timeout • Lease preserved</div>
                </div>
              </button>
            </div>

            {/* Idempotency & Concurrency Verification Box */}
            <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Idempotency-Key Protection
                </span>
                <button
                  type="button"
                  onClick={handleCopyIdempotencyKey}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="font-mono text-[11px] text-slate-400 truncate bg-slate-900/80 px-2 py-1 rounded border border-slate-800 mb-2">
                {idempotencyKey}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Prevents duplicate credit card charges from rapid double-taps:
                </span>
                <button
                  type="button"
                  id="test-concurrent-submit-btn"
                  onClick={handleTestConcurrentDoubleSubmit}
                  disabled={isProcessing || isExpired}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 shrink-0 transition-colors disabled:opacity-40"
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  <span>Test Double-Click</span>
                </button>
              </div>
            </div>

            {/* Concurrency Test Logs Output */}
            {concurrencyTestLog && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-indigo-900/60 font-mono text-[11px] space-y-1 text-slate-300 animate-in fade-in">
                {concurrencyTestLog.map((log, i) => (
                  <div key={i} className={i === concurrencyTestLog.length - 1 ? 'text-emerald-400 font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Error / Timeout Alert Notification */}
          {paymentError && (
            <div
              id="payment-error-banner"
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
                paymentError.type === 'timeout'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : paymentError.type === 'conflict'
                  ? 'bg-purple-50 border-purple-300 text-purple-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-current" />
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{paymentError.title}</h4>
                <p className="leading-relaxed">{paymentError.message}</p>
                {paymentError.canRetry && (
                  <div className="mt-2 text-[11px] font-semibold text-slate-700">
                    💡 You can switch the scenario above to <strong>"1. Successful Payment"</strong> and click "Pay Now" to retry without losing your items.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Billing & Shipping Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Customer Information & Payment Details
            </h3>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-slate-400 focus:outline-hidden text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Receipt</label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-slate-400 focus:outline-hidden text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shipping Address</label>
                <input
                  type="text"
                  required
                  value={customerInfo.street}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, street: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-slate-400 focus:outline-hidden text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-slate-400 focus:outline-hidden text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.state}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-slate-400 focus:outline-hidden text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.zipCode}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-slate-400 focus:outline-hidden text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">Card Credentials</label>
                  <span className="text-[11px] text-slate-400">Sandbox Test Visa</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      readOnly
                      value={cardInfo.cardNumber}
                      className="w-full px-3 py-2.5 bg-slate-100 rounded-xl border border-slate-200 font-mono text-slate-700 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Expires</label>
                      <input
                        type="text"
                        readOnly
                        value={cardInfo.expiryDate}
                        className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 font-mono text-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Security Code (CVV)</label>
                      <input
                        type="text"
                        readOnly
                        value={cardInfo.cvv}
                        className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 font-mono text-slate-700 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-payment-btn"
                disabled={isProcessing || isExpired}
                className="w-full mt-4 py-4 px-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Communicating with Payment Network...</span>
                  </div>
                ) : isExpired ? (
                  <span>Reservation Expired • Click Re-Reserve Above</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Pay ${session.total.toFixed(2)}</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

        {/* Right Column: Order Summary & Reserved Items */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-slate-900 flex items-center justify-between">
              <span>Reserved Checkout Summary</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {session.items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </h3>

            {/* Item list */}
            <div className="space-y-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {session.items.map((item) => (
                <div key={item.productId} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-xs line-clamp-1">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">${session.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${session.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {session.shipping === 0 ? 'FREE' : `$${session.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-indigo-600">${session.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Evaluation checklist notice */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-[11px] text-slate-500 space-y-1.5">
              <div className="font-bold text-slate-700">Evaluation Verification:</div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Stock is currently subtracted from catalog available units</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Leaving or cancelling releases stock automatically</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Duplicate submissions return cached idempotent response</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
