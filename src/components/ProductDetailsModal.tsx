import React, { useState, useEffect } from 'react';
import { Product } from '../types.js';
import { X, Star, Check, Plus, Minus, ShieldCheck, Truck, RefreshCw, AlertTriangle, Layers } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  cartQuantity: number;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  cartQuantity,
}) => {
  const [selectedQty, setSelectedQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setSelectedQty(1);
    setJustAdded(false);
  }, [product]);

  if (!product) return null;

  const available = product.availableStock;
  const remainingCanAdd = Math.max(0, available - cartQuantity);
  const isOutOfStock = available <= 0;
  const isMaxInCart = cartQuantity >= available && available > 0;

  const handleAdd = () => {
    if (selectedQty <= 0 || selectedQty > remainingCanAdd) return;
    onAddToCart(product, selectedQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        id="product-details-modal"
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-details-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-900 shadow-sm border border-slate-200/60 transition-colors"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media Column */}
        <div className="md:w-1/2 bg-slate-100 relative min-h-[280px] md:min-h-[460px] flex items-center justify-center p-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl shadow-inner max-h-[380px]"
          />
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full font-bold text-slate-800 shadow-xs">
              {product.category}
            </span>
            <span className="px-3 py-1 bg-slate-900/90 text-white backdrop-blur-xs rounded-full font-semibold shadow-xs">
              SKU: {product.id.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Details & Action Column */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
          <div>
            {/* Brand and Rating */}
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">
                {product.brand}
              </span>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-900">{product.rating}</span>
                <span className="text-amber-700">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
              {product.name}
            </h2>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Inventory Real-Time State Box */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 mb-5 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Live Warehouse Stock
                </span>
                {isOutOfStock ? (
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    Out of Stock
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {available} available
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1 border-t border-slate-200/50">
                <div>
                  <div className="text-slate-400 font-medium">Physical Stock</div>
                  <div className="font-bold text-slate-800 text-sm">{product.stock}</div>
                </div>
                <div>
                  <div className="text-amber-700 font-medium">In Checkout Leases</div>
                  <div className="font-bold text-amber-700 text-sm">{product.reservedQuantity}</div>
                </div>
                <div>
                  <div className="text-emerald-700 font-medium">Unreserved Units</div>
                  <div className="font-bold text-emerald-700 text-sm">{available}</div>
                </div>
              </div>

              {cartQuantity > 0 && (
                <div className="mt-2 text-[11px] text-indigo-700 font-medium bg-indigo-50/70 px-2.5 py-1 rounded-md border border-indigo-100">
                  You currently have {cartQuantity} in your shopping cart.
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Features list */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Key Specifications
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="pt-4 border-t border-slate-200">
            {isOutOfStock ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center text-xs font-semibold text-red-700 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                This product is currently out of available stock.
              </div>
            ) : isMaxInCart ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs font-semibold text-amber-800">
                You have added all available units to your cart.
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                  <button
                    id="qty-decrement-btn"
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    disabled={selectedQty <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-9 text-center font-bold text-slate-900 text-sm">
                    {selectedQty}
                  </span>
                  <button
                    id="qty-increment-btn"
                    onClick={() => setSelectedQty((q) => Math.min(remainingCanAdd, q + 1))}
                    disabled={selectedQty >= remainingCanAdd}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add Button */}
                <button
                  id="modal-add-to-cart-btn"
                  onClick={handleAdd}
                  disabled={justAdded}
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-indigo-600 text-white'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Cart • ${(product.price * selectedQty).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Micro guarantees */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              <div className="flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Fast Dispatch</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>2-Yr Warranty</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Instant Refund</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
