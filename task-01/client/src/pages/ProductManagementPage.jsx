import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

const formatLKR = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SAMPLE_PRODUCTS = [
  { name: 'Wireless Ergonomic Mouse', price: 6500, availableStock: 25 },
  { name: 'Mechanical Gaming Keyboard', price: 18500, availableStock: 15 },
  { name: 'Noise-Cancelling Headphones', price: 34000, availableStock: 10 },
  { name: '27-inch 4K IPS Monitor', price: 89000, availableStock: 6 },
  { name: 'Smart Fitness Tracker Watch', price: 14500, availableStock: 20 },
  { name: 'Premium Cotton Polo Shirt', price: 4200, availableStock: 30 },
  { name: 'Insulated Travel Coffee Mug', price: 3200, availableStock: 40 },
];

export default function ProductManagementPage({ products, onRefresh, showToast }) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', availableStock: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', price: '', availableStock: '' });

  // Stats calculation
  const totalItems = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.availableStock || 0), 0);
  const lowStockCount = products.filter((p) => p.availableStock > 0 && p.availableStock <= 3).length;
  const outOfStockCount = products.filter((p) => p.availableStock === 0).length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [products, searchFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.availableStock, 10);

    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Price must be greater than 0', 'error');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('Available stock must be an integer >= 0', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createProduct({
        name: formData.name.trim(),
        price: priceNum,
        availableStock: stockNum,
      });
      showToast(`Product "${formData.name.trim()}" created successfully!`, 'success');
      setFormData({ name: '', price: '', availableStock: '' });
      setIsCreating(false);
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to create product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAddSample = async (sample) => {
    try {
      setSubmitting(true);
      await api.createProduct(sample);
      showToast(`Added sample product "${sample.name}"!`, 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to add sample product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditFormData({
      name: product.name,
      price: product.price,
      availableStock: product.availableStock,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '', price: '', availableStock: '' });
  };

  const handleUpdateSubmit = async (id) => {
    const priceNum = parseFloat(editFormData.price);
    const stockNum = parseInt(editFormData.availableStock, 10);

    if (!editFormData.name.trim()) {
      showToast('Product name cannot be empty', 'error');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Price must be greater than 0', 'error');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('Stock must be an integer >= 0', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.updateProduct(id, {
        name: editFormData.name.trim(),
        price: priceNum,
        availableStock: stockNum,
      });
      showToast('Product updated successfully!', 'success');
      setEditingId(null);
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the inventory?`)) {
      return;
    }
    try {
      await api.deleteProduct(id);
      showToast(`Product "${name}" deleted.`, 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory & Product Management</h1>
          <p className="page-subtitle">
            Manage live catalog items, adjust stock counts, set prices in LKR, or seed new inventory.
          </p>
        </div>
        <div className="header-actions">
          <button
            id="btn-open-create-product"
            className="btn-primary"
            onClick={() => setIsCreating(!isCreating)}
          >
            <PlusCircle size={16} />
            <span>{isCreating ? 'Close Form' : 'Add New Product'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-cards-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon-wrap bg-primary-light text-primary">
            <Package size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap bg-success-light text-success">
            <Boxes size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Units in Stock</span>
            <span className="stat-value">{totalStockUnits}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap bg-warning-light text-warning">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Low Stock (≤ 3)</span>
            <span className="stat-value">{lowStockCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap bg-danger-light text-danger">
            <XCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Out of Stock</span>
            <span className="stat-value">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Create Product Form */}
      {isCreating && (
        <div className="card form-card mb-6 animate-fade-in">
          <div className="card-header-with-badge mb-4">
            <h3 className="card-title">Add New Product to Catalog</h3>
            <span className="badge badge-in-stock">New Item</span>
          </div>

          <form onSubmit={handleCreateSubmit} className="product-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="create-product-name">Product Name *</label>
                <input
                  id="create-product-name"
                  type="text"
                  placeholder="e.g. Ergonomic Office Chair"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="create-product-price">Price (LKR) *</label>
                <input
                  id="create-product-price"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 12500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="create-product-stock">Available Units *</label>
                <input
                  id="create-product-stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 25"
                  value={formData.availableStock}
                  onChange={(e) => setFormData({ ...formData, availableStock: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Quick Sample Suggestions */}
            <div className="quick-seed-bar mt-4">
              <span className="text-xs text-muted flex items-center gap-1">
                <Sparkles size={13} className="text-primary" />
                Quick Seed Sample Item:
              </span>
              <div className="quick-seed-chips">
                {SAMPLE_PRODUCTS.slice(0, 4).map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    className="seed-chip"
                    onClick={() => handleQuickAddSample(s)}
                    disabled={submitting}
                  >
                    + {s.name} ({formatLKR(s.price)})
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions mt-5">
              <button
                id="btn-submit-create-product"
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Product to Inventory'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table Card */}
      <div className="card table-card">
        <div className="table-toolbar flex-between p-4 border-b">
          <div className="search-input-wrapper max-w-sm">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Filter inventory table..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            {searchFilter && (
              <button className="search-clear-btn" onClick={() => setSearchFilter('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-secondary btn-sm" onClick={onRefresh} title="Sync database">
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price (LKR)</th>
                <th>Stock Units</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">
                    No products found. Use "Add New Product" to populate items!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isEditing = editingId === p._id;
                  const isLow = p.availableStock > 0 && p.availableStock <= 3;
                  const isOut = p.availableStock === 0;

                  return (
                    <tr key={p._id}>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, name: e.target.value })
                            }
                            className="inline-input"
                          />
                        ) : (
                          <div className="font-semibold text-main">{p.name}</div>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <div className="inline-price-input">
                            <span className="text-xs text-muted mr-1">LKR</span>
                            <input
                              type="number"
                              step="1"
                              min="1"
                              value={editFormData.price}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, price: e.target.value })
                              }
                              className="inline-input w-28"
                            />
                          </div>
                        ) : (
                          <span className="font-mono font-medium">{formatLKR(p.price)}</span>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editFormData.availableStock}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                availableStock: e.target.value,
                              })
                            }
                            className="inline-input w-20"
                          />
                        ) : (
                          <span className="font-mono font-bold">{p.availableStock}</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            isOut
                              ? 'badge-out-of-stock'
                              : isLow
                              ? 'badge-low-stock'
                              : 'badge-in-stock'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      <td className="text-right">
                        {isEditing ? (
                          <div className="inline-action-btns">
                            <button
                              className="btn-icon btn-icon-success"
                              title="Save changes"
                              onClick={() => handleUpdateSubmit(p._id)}
                              disabled={submitting}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="btn-icon btn-icon-secondary"
                              title="Cancel"
                              onClick={cancelEdit}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-action-btns">
                            <button
                              id={`edit-product-${p._id}`}
                              className="btn-icon btn-icon-primary"
                              title="Edit product"
                              onClick={() => startEdit(p)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              id={`delete-product-${p._id}`}
                              className="btn-icon btn-icon-danger"
                              title="Delete product"
                              onClick={() => handleDelete(p._id, p.name)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
