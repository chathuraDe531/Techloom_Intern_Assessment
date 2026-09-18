import React from 'react';
import { CartItem } from '../types.js';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  isReserving: boolean;
  reservationError?: string | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  isReserving,
  reservationError,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal > 150 ? 0 : subtotal > 0 ? 15.0 : 0;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        id="cart-drawer-panel"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200/80 transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-none">
                Shopping Cart
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                id="clear-cart-btn"
                onClick={onClearCart}
                className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded transition-colors"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              id="close-cart-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reservation Error notification */}
        {reservationError && (
          <div className="m-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Stock Reservation Conflict</div>
              <p>{reservationError}</p>
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Explore our store catalog and add items to reserve your stock.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const maxAvailable = item.product.availableStock;
              return (
                <div
                  key={item.product.id}
                  id={`cart-item-${item.product.id}`}
                  className="flex gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-xl object-cover bg-white shrink-0 border border-slate-200/50"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ${item.product.price.toFixed(2)} each
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-md"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= maxAvailable}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-md disabled:opacity-30"
                          title={
                            item.quantity >= maxAvailable ? 'Reached available warehouse stock' : 'Add one'
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-slate-900 text-xs">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {item.quantity >= maxAvailable && (
                      <span className="text-[10px] text-amber-700 font-medium mt-1">
                        Max available ({maxAvailable})
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Calculation & Reserve Checkout */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-200/80 bg-slate-50/70 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Shipping
                  {shipping === 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      FREE over $150
                    </span>
                  )}
                </span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Total Due</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Proceed to Checkout -> Reserves Stock Button */}
            <button
              id="proceed-checkout-btn"
              onClick={onProceedToCheckout}
              disabled={isReserving}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isReserving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Reserving Stock...</span>
                </div>
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stock is temporarily reserved for 3 minutes at checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
