import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { getProductImage, guessCategory } from '../utils/productImages';

export const formatLKR = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProductCard({ product, onAddToCart, inCartQty = 0 }) {
  const [qty, setQty] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= 3;
  const maxAddable = Math.max(0, product.availableStock - inCartQty);

  const handleDecrease = () => setQty((q) => Math.max(1, q - 1));
  const handleIncrease = () => setQty((q) => Math.min(maxAddable, q + 1));

  const handleAddToCart = () => {
    if (maxAddable === 0) return;
    setAdding(true);
    onAddToCart(product, Math.min(qty, maxAddable));
    setTimeout(() => {
      setAdding(false);
      setQty(1);
    }, 700);
  };

  const category = guessCategory(product.name);
  const imageUrl = getProductImage(product.name);

  return (
    <div className={`product-card ${isOutOfStock ? 'product-card-disabled' : ''}`}>
      {/* Product Image & Badges */}
      <div className="product-card-image-wrapper">
        {!imgLoaded && <div className="product-card-image-skeleton shimmer" />}
        <img
          className={`product-card-image ${imgLoaded ? 'loaded' : ''}`}
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
            setImgLoaded(true);
          }}
        />

        {/* Category Pill Over Image */}
        <span className="product-category-overlay">
          {category}
        </span>

        {/* Stock Badge */}
        <span
          className={`product-image-badge badge ${
            isOutOfStock
              ? 'badge-out-of-stock'
              : isLowStock
              ? 'badge-low-stock'
              : 'badge-in-stock'
          }`}
        >
          {isLowStock && <span className="pulse-dot" />}
          {isOutOfStock
            ? 'Out of Stock'
            : isLowStock
            ? `Only ${product.availableStock} left!`
            : `In Stock: ${product.availableStock}`}
        </span>

        {/* In Cart Indicator */}
        {inCartQty > 0 && (
          <div className="in-cart-indicator-tag">
            <Check size={12} />
            <span>{inCartQty} in cart</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="product-card-body">
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        <div className="product-price-row">
          <div className="price-container">
            <span className="price-currency">LKR</span>
            <span className="price-amount">
              {Number(product.price).toLocaleString('en-LK', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {product.availableStock > 0 && (
            <span className="stock-hint">
              {maxAddable > 0 ? `${maxAddable} available to add` : 'Max added'}
            </span>
          )}
        </div>

        {/* Interactive Controls */}
        {!isOutOfStock && maxAddable > 0 ? (
          <div className="product-card-actions">
            <div className="qty-stepper" title="Select quantity to add">
              <button
                id={`qty-dec-${product._id}`}
                className="qty-stepper-btn"
                onClick={handleDecrease}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="qty-stepper-value">{qty}</span>
              <button
                id={`qty-inc-${product._id}`}
                className="qty-stepper-btn"
                onClick={handleIncrease}
                disabled={qty >= maxAddable}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              id={`add-to-cart-${product._id}`}
              className={`btn-add-cart ${adding ? 'btn-add-cart-adding' : ''}`}
              onClick={handleAddToCart}
            >
              {adding ? (
                <>
                  <Check size={16} className="pop-icon" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  <span>{inCartQty > 0 ? `+ Add (${qty})` : `Add (${qty})`}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button className="btn-add-cart btn-disabled" disabled>
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Sold Out' : `Max in Cart (${inCartQty})`}</span>
          </button>
        )}
      </div>
    </div>
  );
}
