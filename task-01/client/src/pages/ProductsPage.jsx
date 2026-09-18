import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { RefreshCw, Search, ShoppingBag, X, SlidersHorizontal, Zap, ShieldCheck, Clock } from 'lucide-react';
import { guessCategory } from '../utils/productImages';

const CATEGORIES = ['All', 'Electronics', 'Computers', 'Clothing', 'Food & Drinks', 'Books', 'General'];

export default function ProductsPage({ products, loading, onRefresh, onAddToCart, cart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Calculate cart quantities map: productId -> quantity
  const cartQtyMap = useMemo(() => {
    return cart.reduce((acc, item) => {
      acc[item.productId] = item.quantity;
      return acc;
    }, {});
  }, [cart]);

  // Filter & Sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Name search filter
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // Category filter
        if (selectedCategory !== 'All') {
          const cat = guessCategory(p.name);
          if (cat !== selectedCategory) return false;
        }

        // In Stock filter
        if (inStockOnly && p.availableStock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-desc') return b.availableStock - a.availableStock;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0; // Default order
      });
  }, [products, searchTerm, selectedCategory, inStockOnly, sortBy]);

  const totalInStock = products.filter((p) => p.availableStock > 0).length;

  return (
    <div className="page-container">
      {/* Hero Welcome Banner */}
      <div className="store-hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} className="text-amber" />
            <span>High-Concurrency POS System</span>
          </div>
          <h1 className="hero-title">Live Store Catalog</h1>
          <p className="hero-subtitle">
            Explore items with guaranteed real-time stock reservations and frictionless instant checkout.
          </p>
          <div className="hero-features">
            <div className="feature-pill">
              <ShieldCheck size={15} />
              <span>Atomic 5-Min Stock Lock</span>
            </div>
            <div className="feature-pill">
              <Clock size={15} />
              <span>Auto-Restoration on Expiry</span>
            </div>
            <div className="feature-pill">
              <span className="dot-live" />
              <span>{totalInStock} Items Available Now</span>
            </div>
          </div>
        </div>

        <button
          id="refresh-products-btn"
          className="btn-glass hero-refresh-btn"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh live inventory from database"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Syncing...' : 'Sync Stock'}</span>
        </button>
      </div>

      {/* Interactive Controls Bar: Search, Categories, Filters */}
      <div className="catalog-toolbar card">
        <div className="toolbar-top-row">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              id="product-search-input"
              type="text"
              placeholder="Search products by title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="toolbar-sort-wrap">
            <SlidersHorizontal size={16} className="text-muted" />
            <select
              id="sort-select"
              className="select-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="name-asc">Alphabetical (A - Z)</option>
            </select>
          </div>

          {/* In Stock Only Checkbox */}
          <label className="checkbox-pill-label">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            <span>In-Stock Only</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="category-pills-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Count Bar */}
      <div className="catalog-meta-bar">
        <span className="results-count">
          Showing <strong>{filteredProducts.length}</strong> of {products.length} products
          {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
          {inStockOnly && ` (In Stock)`}
        </span>
      </div>

      {/* Products Grid or Empty / Loading State */}
      {loading && products.length === 0 ? (
        <div className="loading-state card">
          <RefreshCw size={36} className="spin text-primary" />
          <h3>Connecting to Real-Time Inventory...</h3>
          <p className="text-muted">Fetching latest prices and verified database stock levels.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state card">
          <ShoppingBag size={54} className="text-muted mb-3" />
          <h3>No products match your criteria</h3>
          <p className="text-muted mb-4">
            Try adjusting your search terms, changing categories, or clearing filters.
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setInStockOnly(false);
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={onAddToCart}
              inCartQty={cartQtyMap[product._id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
