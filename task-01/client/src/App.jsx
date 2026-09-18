import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProductsPage from './pages/ProductsPage';
import ProductManagementPage from './pages/ProductManagementPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrderResultPage from './pages/OrderResultPage';
import FloatingCartBar from './components/FloatingCartBar';
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, ShieldCheck, ShoppingBag, ShoppingCart, X } from 'lucide-react';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [toast, setToast] = useState(null);
  const [guideStep, setGuideStep] = useState(() => {
    try {
      return localStorage.getItem('pos_onboarding_seen') === 'true' ? null : 0;
    } catch {
      return 0;
    }
  });

  // Cart state stored in localStorage for persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Order & Reservation State
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [currentPayment, setCurrentPayment] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pos_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Could not save cart:', e);
    }
  }, [cart]);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await api.getProducts();
      setProducts(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch products', 'error');
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cart Actions
  const handleAddToCart = (product, qty = 1) => {
    if (product.availableStock <= 0) {
      showToast('Product is out of stock', 'error');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product._id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.availableStock) {
          showToast(`Cannot add more. Max available stock is ${product.availableStock}`, 'error');
          return prevCart;
        }
        showToast(`Updated "${product.name}" quantity to ${newQty}`, 'success');
        return prevCart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: newQty }
            : item
        );
      } else {
        showToast(`Added ${qty}× "${product.name}" to cart`, 'success');
        return [
          ...prevCart,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: qty,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    showToast('Item removed from cart', 'info');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Cart cleared', 'info');
  };

  // Checkout Flow
  const handleProceedToCheckout = () => {
    setActiveTab('checkout');
  };

  const handleOrderCreated = (order, reservation) => {
    setCurrentOrder(order);
    setCurrentReservation(reservation);
    setCart([]); // Clear cart once order reservation is established
    setActiveTab('payment');
    fetchProducts(); // Refresh products to reflect atomically reduced availableStock!
  };

  // Payment Simulation Flow
  const handlePaymentComplete = (order, payment, outcome) => {
    setCurrentOrder(order);
    setCurrentPayment(payment);
    setActiveTab('result');
    fetchProducts(); // Refresh products to reflect stock permanent consumption or restoration!
  };

  const handleCancelOrder = (order) => {
    setCurrentOrder(order);
    setActiveTab('result');
    fetchProducts();
  };

  const handleReturnToStore = () => {
    setCurrentOrder(null);
    setCurrentReservation(null);
    setCurrentPayment(null);
    setActiveTab('products');
    fetchProducts();
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const workflowSteps = [
    { id: 'products', label: 'Browse', icon: ShoppingBag, title: 'Browse the store', description: 'Explore live products, filter the catalog, and add what you need to your cart.' },
    { id: 'cart', label: 'Review cart', icon: ShoppingCart, title: 'Review your cart', description: 'Check quantities, stock availability, and the estimated total before continuing.' },
    { id: 'checkout', label: 'Reserve stock', icon: ShieldCheck, title: 'Reserve your stock', description: 'Place a temporary 5-minute hold on your items so nobody else can purchase them.' },
    { id: 'payment', label: 'Pay', icon: CreditCard, title: 'Complete payment', description: 'Choose a payment option and complete the payment step while your reservation is active.' },
    { id: 'result', label: 'Done', icon: CheckCircle2, title: 'See your result', description: 'Review the final order status and return to the store when you are finished.' },
  ];
  const workflowIndex = workflowSteps.findIndex((step) => step.id === activeTab);

  const finishGuide = () => {
    try {
      localStorage.setItem('pos_onboarding_seen', 'true');
    } catch {
      // Continue even when browser storage is unavailable.
    }
    setGuideStep(null);
  };

  const handleWorkflowNavigate = (stepId) => {
    if (stepId === 'checkout' && cart.length === 0) {
      showToast('Add at least one item before reserving stock.', 'info');
      setActiveTab('products');
      return;
    }
    if (stepId === 'payment' && !currentOrder) {
      showToast('Reserve your cart first to continue to payment.', 'info');
      setActiveTab(cart.length > 0 ? 'checkout' : 'products');
      return;
    }
    if (stepId === 'result' && !currentOrder) {
      showToast('Complete an order to view its result.', 'info');
      setActiveTab('products');
      return;
    }
    setActiveTab(stepId);
  };

  return (
    <div className="app-wrapper">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItemCount={totalCartCount}
        cartTotalAmount={totalCartAmount}
      />

      <main className="main-content">
        {activeTab !== 'management' && (
          <div className="workflow-strip" aria-label="Order progress">
            <div className="workflow-strip-heading">
              <span className="workflow-kicker">Your order</span>
              <span className="workflow-status">
                {workflowSteps[Math.max(workflowIndex, 0)]?.label || 'Browse'}
              </span>
            </div>
            <div className="workflow-steps">
              {workflowSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    className={`workflow-step ${index <= workflowIndex ? 'is-active' : ''}`}
                    onClick={() => handleWorkflowNavigate(step.id)}
                    title={`Go to ${step.label}`}
                  >
                    <span className="workflow-step-number">{index + 1}</span>
                    <span>{step.label}</span>
                  </button>
                  {index < workflowSteps.length - 1 && (
                    <span className={`workflow-connector ${index < workflowIndex ? 'is-complete' : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <>
            <ProductsPage
              products={products}
              loading={loadingProducts}
              onRefresh={fetchProducts}
              onAddToCart={handleAddToCart}
              cart={cart}
            />
            <FloatingCartBar
              cart={cart}
              onOpenCart={() => setActiveTab('cart')}
              onProceedToCheckout={handleProceedToCheckout}
            />
          </>
        )}

        {activeTab === 'management' && (
          <ProductManagementPage
            products={products}
            onRefresh={fetchProducts}
            showToast={showToast}
          />
        )}

        {activeTab === 'cart' && (
          <CartPage
            cart={cart}
            products={products}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onProceedToCheckout={handleProceedToCheckout}
            onContinueShopping={() => setActiveTab('products')}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutPage
            cart={cart}
            onBackToCart={() => setActiveTab('cart')}
            onOrderCreated={handleOrderCreated}
            showToast={showToast}
          />
        )}

        {activeTab === 'payment' && currentOrder && (
          <PaymentPage
            order={currentOrder}
            reservation={currentReservation}
            onPaymentComplete={handlePaymentComplete}
            onCancelOrder={handleCancelOrder}
            onReturnToStore={handleReturnToStore}
            showToast={showToast}
          />
        )}

        {activeTab === 'result' && currentOrder && (
          <OrderResultPage
            order={currentOrder}
            payment={currentPayment}
            onReturnToStore={handleReturnToStore}
            onRefreshOrder={(updated) => {
              setCurrentOrder(updated);
              fetchProducts();
            }}
            showToast={showToast}
          />
        )}
      </main>

      {guideStep !== null && (
        <div className="guide-backdrop" role="presentation">
          <section className="guide-dialog" role="dialog" aria-modal="true" aria-labelledby="guide-title">
            <button type="button" className="guide-close btn-icon" onClick={finishGuide} aria-label="Close getting started guide">
              <X size={18} />
            </button>
            <div className="guide-progress" aria-label={`Guide step ${guideStep + 1} of ${workflowSteps.length}`}>
              {workflowSteps.map((step, index) => (
                <span key={step.id} className={index <= guideStep ? 'is-complete' : ''} />
              ))}
            </div>
            <div className="guide-icon">
              {(() => {
                const GuideIcon = workflowSteps[guideStep].icon;
                return <GuideIcon size={30} />;
              })()}
            </div>
            <p className="guide-eyebrow">Getting started · Step {guideStep + 1} of {workflowSteps.length}</p>
            <h2 id="guide-title">{workflowSteps[guideStep].title}</h2>
            <p className="guide-description">{workflowSteps[guideStep].description}</p>
            <div className="guide-actions">
              <button type="button" className="btn-secondary btn-sm" onClick={finishGuide}>Skip guide</button>
              <div className="guide-next-actions">
                {guideStep > 0 && (
                  <button type="button" className="btn-secondary btn-sm" onClick={() => setGuideStep((step) => step - 1)}>
                    <ArrowLeft size={15} />
                    <span>Back</span>
                  </button>
                )}
                {guideStep < workflowSteps.length - 1 ? (
                  <button type="button" className="btn-primary btn-sm" onClick={() => setGuideStep((step) => step + 1)}>
                    <span>Next</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button type="button" className="btn-primary btn-sm" onClick={finishGuide}>
                    <span>Start browsing</span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
