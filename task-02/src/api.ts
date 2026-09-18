import { Product, CheckoutSession, Order, PaymentScenario, InventoryAuditLog } from './types.js';

export const api = {
  async getProducts(params?: {
    search?: string;
    category?: string;
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.inStockOnly) query.append('inStockOnly', 'true');
    if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load products');
    const data = await res.json();
    return data.products;
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    const data = await res.json();
    return data.product;
  },

  async reserveCheckout(items: { productId: string; quantity: number }[]): Promise<{
    success: boolean;
    session: CheckoutSession;
    message?: string;
  }> {
    const res = await fetch('/api/checkout/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to reserve stock');
    }
    return data;
  },

  async releaseReservation(sessionId: string, reason?: string): Promise<boolean> {
    const res = await fetch('/api/checkout/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, reason }),
    });
    const data = await res.json();
    return data.success;
  },

  async getSession(sessionId: string): Promise<{ session: CheckoutSession; remainingSeconds: number }> {
    const res = await fetch(`/api/checkout/session/${sessionId}`);
    if (!res.ok) throw new Error('Session not found');
    return res.json();
  },

  async processPayment(payload: {
    sessionId: string;
    idempotencyKey: string;
    scenario: PaymentScenario;
    cardDetails: {
      cardNumber: string;
      cardholderName: string;
      expiryDate: string;
      cvv: string;
    };
    billingAddress: {
      name: string;
      email: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }): Promise<{
    success?: boolean;
    order?: Order;
    transactionId?: string;
    duplicateDetected?: boolean;
    idempotentReplay?: boolean;
    message?: string;
  }> {
    const res = await fetch('/api/payment/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.message || data.error || 'Payment failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to load orders');
    const data = await res.json();
    return data.orders;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    const data = await res.json();
    return data.order;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<{ order: Order; message: string }> {
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to cancel order');
    }
    return data;
  },

  async getMetrics(): Promise<{
    totalInventoryUnits: number;
    totalReservedUnits: number;
    activeSessionsCount: number;
    totalOrdersCount: number;
    paidOrdersCount: number;
    refundedOrdersCount: number;
    reservationTtlMs: number;
  }> {
    const res = await fetch('/api/system/metrics');
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async getAuditLogs(): Promise<InventoryAuditLog[]> {
    const res = await fetch('/api/system/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const data = await res.json();
    return data.logs;
  },

  async resetSystem(): Promise<boolean> {
    const res = await fetch('/api/system/reset', { method: 'POST' });
    return res.ok;
  }
};
