import React, { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, CheckoutSession, Order } from './types.js';
import { api } from './api.js';
import { Navbar } from './components/Navbar.js';
import { FilterBar } from './components/FilterBar.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductDetailsModal } from './components/ProductDetailsModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutView } from './components/CheckoutView.js';
import { OrdersView } from './components/OrdersView.js';
import { OrderSuccessModal } from './components/OrderSuccessModal.js';
import { SystemDiagnosticsModal } from './components/SystemDiagnosticsModal.js';
import { ShieldCheck, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation & Views
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'checkout'>('shop');
  
  // Products & Discovery State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [priceBracket, setPriceBracket] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Active Product Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart State (Persisted in localStorage for convenience across reloads)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('apex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Checkout & Reservation State
  const [activeSession, setActiveSession] = useState<CheckoutSession | null>(() => {
    try {
      const saved = localStorage.getItem('apex_active_session');
      if (saved) {
        const session: CheckoutSession = JSON.parse(saved);
        if (session.expiresAt > Date.now() && session.status === 'ACTIVE_RESERVED') {
          return session;
        }
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isReserving, setIsReserving] = useState<boolean>(false);
  const [reservationError, setReservationError] = useState<string | null>(null);

  // Success Modal
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [lastTxId, setLastTxId] = useState<string>('');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);

  // Diagnostics Modal
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('apex_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Save active session to local storage
  useEffect(() => {
    try {
      if (activeSession) {
        localStorage.setItem('apex_active_session', JSON.stringify(activeSession));
      } else {
        localStorage.removeItem('apex_active_session');
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeSession]);

  // Load products based on discovery filters
  const loadProducts = useCallback(async () => {
    try {
      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      if (priceBracket === 'under100') {
        maxPrice = 100;
      } else if (priceBracket === '100to200') {
        minPrice = 100;
        maxPrice = 200;
      } else if (priceBracket === 'over200') {
        minPrice = 200;
      }

      const list = await api.getProducts({
        search: searchQuery,
        category: selectedCategory,
        inStockOnly,
        minPrice,
        maxPrice,
        sort: sortBy,
      });

      setProducts(list);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [searchQuery, selectedCategory, inStockOnly, priceBracket, sortBy]);

  // Load Orders
  const loadOrders = useCallback(async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Periodically refresh products so reservation lease changes show in real time
  useEffect(() => {
    const interval = setInterval(() => {
      loadProducts();
    }, 4000);
    return () => clearInterval(interval);
  }, [loadProducts]);

  // Cart Management
  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const available = product.availableStock;

      if (existing) {
        const newQty = Math.min(available, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prev, { product, quantity: Math.min(available, quantity) }];
      }
    });
    setReservationError(null);
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(item.product.availableStock, newQty);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
    setReservationError(null);
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    setReservationError(null);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setReservationError(null);
  };

  // Stock Reservation Flow
  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsReserving(true);
    setReservationError(null);

    try {
      const payload = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await api.reserveCheckout(payload);
      setActiveSession(res.session);
      setIsCartOpen(false);
      setActiveTab('checkout');
      loadProducts(); // refresh products to show new reserved numbers
    } catch (err: any) {
      setReservationError(err.message || 'Unable to reserve items for checkout.');
      loadProducts();
    } finally {
      setIsReserving(false);
    }
  };

  // Release reservation (user cancelled or exited checkout)
  const handleCancelCheckout = async () => {
    if (activeSession) {
      try {
        await api.releaseReservation(activeSession.sessionId, 'User exited checkout view');
      } catch (e) {
        console.error('Failed to release reservation', e);
      }
      setActiveSession(null);
    }
    setActiveTab('shop');
    loadProducts();
  };

  // Re-reserve items if lease expired
  const handleReReserve = async () => {
    if (!activeSession) return;
    setIsReserving(true);

    try {
      const payload = activeSession.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));

      const res = await api.reserveCheckout(payload);
      setActiveSession(res.session);
      loadProducts();
    } catch (err: any) {
      alert(`Could not re-reserve items: ${err.message}`);
      loadProducts();
    } finally {
      setIsReserving(false);
    }
  };

  // Payment Success Handler
  const handlePaymentSuccess = (order: Order, txId: string) => {
    setSuccessOrder(order);
    setLastTxId(txId);
    setActiveSession(null);
    setCartItems([]);
    loadProducts();
    loadOrders();
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setInStockOnly(false);
    setPriceBracket('all');
    setSortBy('featured');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top App Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (activeTab === 'checkout' && tab !== 'checkout') {
            // If user leaves checkout without paying, warn them
            if (activeSession && confirm('Leave checkout? Your stock reservation lease will remain held until it expires.')) {
              setActiveTab(tab);
            }
          } else {
            setActiveTab(tab);
          }
        }}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openDiagnostics={() => setIsDiagnosticsOpen(true)}
        activeReservationExpiresAt={activeSession?.expiresAt}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            
            {/* Hero / Header info bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Shopping & Payment Gateway</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  High-Performance Gear & Electronics
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
                  Real-time stock reservation, idempotency protection, and simulated failure recovery.
                </p>
              </div>

              {/* Quick simulation tip banner */}
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600">
                  Try checking out <strong>Vanguard Watch</strong> (only 3 in stock) to observe live warehouse reservations!
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              priceBracket={priceBracket}
              setPriceBracket={setPriceBracket}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={handleResetFilters}
              totalResults={products.length}
            />

            {/* Product Grid */}
            {isLoadingProducts ? (
              <div className="py-24 text-center">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-600">Loading catalog inventory...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto my-8">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base mb-1">No matching products</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Try adjusting your search query, price filter, or category selection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const inCartItem = cartItems.find((i) => i.product.id === product.id);
                  const cartQty = inCartItem ? inCartItem.quantity : 0;

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onOpenDetails={(p) => setSelectedProduct(p)}
                      cartQuantity={cartQty}
                    />
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* Checkout View */}
        {activeTab === 'checkout' && (
          activeSession ? (
            <CheckoutView
              session={activeSession}
              onPaymentSuccess={handlePaymentSuccess}
              onCancelCheckout={handleCancelCheckout}
              onReReserve={handleReReserve}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xs">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No Active Checkout Session</h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Add products to your cart and proceed to checkout to reserve stock.
              </p>
              <button
                onClick={() => setActiveTab('shop')}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Return to Store
              </button>
            </div>
          )
        )}

        {/* Order History View */}
        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onOrderUpdated={() => {
              loadOrders();
              loadProducts();
            }}
            onNavigateToShop={() => setActiveTab('shop')}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        isReserving={isReserving}
        reservationError={reservationError}
      />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          cartQuantity={
            cartItems.find((i) => i.product.id === selectedProduct.id)?.quantity || 0
          }
        />
      )}

      {/* Order Success Modal */}
      {successOrder && (
        <OrderSuccessModal
          order={successOrder}
          transactionId={lastTxId}
          onClose={() => setSuccessOrder(null)}
          onViewOrders={() => {
            setSuccessOrder(null);
            setActiveTab('orders');
          }}
        />
      )}

      {/* System Diagnostics & Stock Ledger Modal */}
      <SystemDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        onStoreReset={() => {
          loadProducts();
          loadOrders();
          setActiveSession(null);
        }}
      />

      {/* Subtle Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              E-Commerce Checkout & Payment System
            </span>
            <span>— Concurrency-Safe Stock Reservation & Idempotent Gateway</span>
          </div>

          <button
            onClick={() => setIsDiagnosticsOpen(true)}
            className="text-slate-500 hover:text-slate-900 underline font-medium text-[11px]"
          >
            Open Live Stock & Reservation Ledger
          </button>
        </div>
      </footer>

    </div>
  );
}
