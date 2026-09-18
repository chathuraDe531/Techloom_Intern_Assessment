import { Product, CheckoutSession, Order, InventoryAuditLog, PaymentScenario } from '../src/types.js';

// Initial Mock Inventory
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_aura_pro',
    name: 'Aura Studio Wireless ANC Headphones',
    brand: 'SonicAura',
    category: 'Audio',
    price: 249.99,
    originalPrice: 299.99,
    rating: 4.9,
    reviewCount: 328,
    description: 'Flagship circumaural headphones engineered with custom 40mm titanium dynamic drivers, 45dB hybrid active noise cancellation, spatial audio tracking, and 50-hour battery life.',
    features: [
      'Custom 40mm Titanium Drivers',
      'Adaptive Hybrid ANC with Transparency Mode',
      '50-Hour Playback with Ultra-Fast Charge',
      'Multipoint Bluetooth 5.4 with LDAC & AAC'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop',
    stock: 8,
    reservedQuantity: 0,
    availableStock: 8
  },
  {
    id: 'prod_pulse_runner',
    name: 'Pulse Flow Carbon Aero Running Shoes',
    brand: 'AeroVelocity',
    category: 'Footwear',
    price: 185.00,
    originalPrice: 210.00,
    rating: 4.8,
    reviewCount: 194,
    description: 'Marathon-grade racing trainers featuring dual-density supercritical nitrogen foam, a full-length curved carbon fiber propulsion plate, and water-repellent engineered mesh.',
    features: [
      'Full-Length Carbon Fiber Articulated Plate',
      'Supercritical Nitrogen Infused Midsole',
      'Ultra-Breathable Mono-Mesh Upper',
      'Continental Rubber Traction Outsole'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop',
    stock: 5,
    reservedQuantity: 0,
    availableStock: 5
  },
  {
    id: 'prod_chrono_titanium',
    name: 'Vanguard Titanium Sapphire Smartwatch',
    brand: 'Vanguard Time',
    category: 'Wearables',
    price: 399.00,
    rating: 4.7,
    reviewCount: 142,
    description: 'Precision grade 5 titanium chassis, scratch-proof sapphire crystal touch display, ECG arrhythmia detection, dual-frequency multi-GNSS satellite positioning, and 100m water resistance.',
    features: [
      'Aerospace Grade 5 Titanium Bezel',
      '1.43" Always-On AMOLED with Sapphire Crystal',
      'Clinical-Grade Optical Heart Rate & ECG',
      '14-Day Tactical Battery Life'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop',
    stock: 3, // Low stock for easy testing!
    reservedQuantity: 0,
    availableStock: 3
  },
  {
    id: 'prod_lumen_glow',
    name: 'Luminary Ambient Light Bar & Desk Studio',
    brand: 'NordicLight',
    category: 'Smart Tech',
    price: 129.50,
    originalPrice: 149.00,
    rating: 4.9,
    reviewCount: 512,
    description: 'Architectural desk light bar with auto-dimming ambient optical sensors, asymmetric glare-free beam path, wireless rotatory dial, and CRI 97 natural sunlight reproduction.',
    features: [
      'Zero Screen Reflection Asymmetric Optics',
      'Stepless Color Temp Tuning (2700K - 6500K)',
      'Precision Wireless Control Puck',
      'CRI 97 True Color Rendering'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80&auto=format&fit=crop',
    stock: 12,
    reservedQuantity: 0,
    availableStock: 12
  },
  {
    id: 'prod_nomad_pack',
    name: 'Nomad 28L Weatherproof Commuter Pack',
    brand: 'Arcane Carry',
    category: 'Lifestyle',
    price: 168.00,
    rating: 4.6,
    reviewCount: 89,
    description: 'Modular daily urban pack fabricated from 100% recycled 840D ballistic nylon with TPU water-resistant coating, magnetic Fidlock buckles, and dedicated padded 16" laptop vault.',
    features: [
      'Recycled Ballistic Cordura Nylon',
      'Fidlock V-Buckle Magnetic Closures',
      'Ergonomic Dual-Density EVA Backpanel',
      'Drop-Proof Suspended 16" Tech Compartment'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop',
    stock: 6,
    reservedQuantity: 0,
    availableStock: 6
  },
  {
    id: 'prod_zenith_earbuds',
    name: 'Zenith Clarity True Wireless Hi-Fi Buds',
    brand: 'SonicAura',
    category: 'Audio',
    price: 159.00,
    originalPrice: 189.00,
    rating: 4.8,
    reviewCount: 275,
    description: 'Compact wireless earbuds featuring beryllium dynamic drivers, dual-chamber acoustic enclosure, personalized hearing profiles, and IPX7 sweat immersion resistance.',
    features: [
      'Pure Beryllium Acoustic Architecture',
      '6 Beamforming Microphones with Wind Guard',
      'Qi Wireless Charging Case (36 Hours total)',
      'Low Latency Gaming & Media Mode'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80&auto=format&fit=crop',
    stock: 4,
    reservedQuantity: 0,
    availableStock: 4
  },
  {
    id: 'prod_thermal_bottle',
    name: 'HydroPure Insulated Ion Flask 750ml',
    brand: 'NordicLight',
    category: 'Lifestyle',
    price: 45.00,
    rating: 4.9,
    reviewCount: 420,
    description: 'Double-wall vacuum insulated 18/8 food-grade kitchen stainless steel flask with ceramic interior lining that eliminates metallic taste and keeps cold drinks chilled for 36 hours.',
    features: [
      'Ceramic Interior Glaze Lining',
      'Cold for 36 Hours / Hot for 18 Hours',
      'Leakproof Flow-Through Cap',
      'BPA and Phthalate Free'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80&auto=format&fit=crop',
    stock: 15,
    reservedQuantity: 0,
    availableStock: 15
  },
  {
    id: 'prod_mechanical_board',
    name: 'Origin 75 Wireless Custom Mechanical Keyboard',
    brand: 'Smart Tech',
    category: 'Smart Tech',
    price: 195.00,
    originalPrice: 220.00,
    rating: 4.9,
    reviewCount: 380,
    description: 'CNC anodized aluminum gasket-mounted 75% mechanical keyboard with hot-swappable tactile linear switches, south-facing RGB, and tri-mode 2.4G/Bluetooth/USB-C connection.',
    features: [
      'Solid CNC Machined 6063 Aluminum Chassis',
      'Gasket Mount Structure with Poron Sound Dampening',
      'Factory Lubed Smooth Switches',
      'PBT Dye-Sub Premium Keycaps'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80&auto=format&fit=crop',
    stock: 2, // Low stock for testing!
    reservedQuantity: 0,
    availableStock: 2
  }
];

class InventoryAndPaymentStore {
  private products: Map<string, Product> = new Map();
  private sessions: Map<string, CheckoutSession> = new Map();
  private orders: Map<string, Order> = new Map();
  private auditLogs: InventoryAuditLog[] = [];
  
  // Idempotency ledger
  // Key: idempotencyKey -> status, result, timestamp
  private idempotencyLedger: Map<string, {
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    response?: any;
    statusCode: number;
    createdAt: number;
    lockedUntil: number;
  }> = new Map();

  // Configurable reservation timeout in milliseconds (default 3 minutes = 180,000ms for realistic yet testable leases)
  public reservationTtlMs = 180000;

  constructor() {
    this.resetStore();
    
    // Background worker: sweeps expired stock reservations every 3 seconds
    setInterval(() => {
      this.sweepExpiredReservations();
    }, 3000);
  }

  public resetStore() {
    this.products.clear();
    this.sessions.clear();
    this.orders.clear();
    this.auditLogs = [];
    this.idempotencyLedger.clear();

    INITIAL_PRODUCTS.forEach(p => {
      this.products.set(p.id, {
        ...p,
        reservedQuantity: 0,
        availableStock: p.stock
      });
    });

    this.logAudit('SYSTEM', 'All Products', 'RESTORED_REFUND', 0, 0, 0, 0, 0, 'Store initialized to default inventory');
  }

  // --- Products ---
  public getAllProducts(search?: string, category?: string, inStockOnly?: boolean, minPrice?: number, maxPrice?: number, sort?: string): Product[] {
    let list = Array.from(this.products.values()).map(p => ({
      ...p,
      availableStock: Math.max(0, p.stock - p.reservedQuantity)
    }));

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      list = list.filter(p => p.category === category);
    }

    if (inStockOnly) {
      list = list.filter(p => p.availableStock > 0);
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      list = list.filter(p => p.price >= minPrice);
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      list = list.filter(p => p.price <= maxPrice);
    }

    if (sort) {
      switch (sort) {
        case 'price-asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'reviews':
          list.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        default:
          break;
      }
    }

    return list;
  }

  public getProductById(id: string): Product | null {
    const product = this.products.get(id);
    if (!product) return null;
    return {
      ...product,
      availableStock: Math.max(0, product.stock - product.reservedQuantity)
    };
  }

  // --- Stock Reservation Logic ---
  public reserveStock(items: { productId: string; quantity: number }[]): {
    success: boolean;
    session?: CheckoutSession;
    error?: string;
    insufficientItem?: { name: string; available: number; requested: number };
  } {
    if (!items || items.length === 0) {
      return { success: false, error: 'Cannot reserve an empty cart.' };
    }

    // Step 1: Validate stock atomically before mutating
    for (const req of items) {
      const prod = this.products.get(req.productId);
      if (!prod) {
        return { success: false, error: `Product not found: ${req.productId}` };
      }
      const available = prod.stock - prod.reservedQuantity;
      if (req.quantity <= 0) {
        return { success: false, error: `Invalid quantity for ${prod.name}` };
      }
      if (available < req.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Only ${available} available (requested ${req.quantity}).`,
          insufficientItem: {
            name: prod.name,
            available,
            requested: req.quantity
          }
        };
      }
    }

    // Step 2: Apply reservations
    const sessionItems: CheckoutSession['items'] = [];
    let subtotal = 0;

    for (const req of items) {
      const prod = this.products.get(req.productId)!;
      const prevReserved = prod.reservedQuantity;
      prod.reservedQuantity += req.quantity;
      prod.availableStock = prod.stock - prod.reservedQuantity;

      sessionItems.push({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: req.quantity,
        imageUrl: prod.imageUrl
      });

      subtotal += prod.price * req.quantity;

      this.logAudit(
        prod.id,
        prod.name,
        'RESERVED',
        req.quantity,
        prod.stock,
        prod.stock,
        prevReserved,
        prod.reservedQuantity,
        `Reserved ${req.quantity} unit(s) for checkout session`
      );
    }

    const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const reservationId = `res_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const now = Date.now();
    const expiresAt = now + this.reservationTtlMs;
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% sales tax
    const shipping = subtotal > 150 ? 0 : 15.00; // Free shipping over $150
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    const session: CheckoutSession = {
      sessionId,
      reservationId,
      items: sessionItems,
      subtotal,
      tax,
      shipping,
      total,
      status: 'ACTIVE_RESERVED',
      createdAt: now,
      expiresAt,
      idempotencyKey: `idemp_${sessionId}`
    };

    this.sessions.set(sessionId, session);
    return { success: true, session };
  }

  // Release reservation manually (e.g. user clicks "Cancel Checkout" or leaves)
  public releaseReservation(sessionId: string, reason = 'User cancelled checkout'): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    if (session.status !== 'ACTIVE_RESERVED' && session.status !== 'PAYMENT_PENDING') {
      return false; // already completed or expired
    }

    for (const item of session.items) {
      const prod = this.products.get(item.productId);
      if (prod) {
        const prevReserved = prod.reservedQuantity;
        prod.reservedQuantity = Math.max(0, prod.reservedQuantity - item.quantity);
        prod.availableStock = prod.stock - prod.reservedQuantity;

        this.logAudit(
          prod.id,
          prod.name,
          'RELEASED_MANUAL',
          item.quantity,
          prod.stock,
          prod.stock,
          prevReserved,
          prod.reservedQuantity,
          `${reason} (Session: ${sessionId})`
        );
      }
    }

    session.status = 'CANCELLED';
    return true;
  }

  // Sweep expired reservations
  public sweepExpiredReservations() {
    const now = Date.now();
    for (const session of this.sessions.values()) {
      if (session.status === 'ACTIVE_RESERVED' && now > session.expiresAt) {
        session.status = 'EXPIRED';
        for (const item of session.items) {
          const prod = this.products.get(item.productId);
          if (prod) {
            const prevReserved = prod.reservedQuantity;
            prod.reservedQuantity = Math.max(0, prod.reservedQuantity - item.quantity);
            prod.availableStock = prod.stock - prod.reservedQuantity;

            this.logAudit(
              prod.id,
              prod.name,
              'RELEASED_EXPIRY',
              item.quantity,
              prod.stock,
              prod.stock,
              prevReserved,
              prod.reservedQuantity,
              `TTL expired (${this.reservationTtlMs / 1000}s lease). Stock returned to catalog.`
            );
          }
        }
      }
    }
  }

  public getSession(sessionId: string): CheckoutSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Refresh status if expired
    if (session.status === 'ACTIVE_RESERVED' && Date.now() > session.expiresAt) {
      this.sweepExpiredReservations();
    }
    return session;
  }

  // --- Idempotency & Payment Handling ---
  public getIdempotencyRecord(key: string) {
    return this.idempotencyLedger.get(key);
  }

  public lockIdempotencyKey(key: string) {
    this.idempotencyLedger.set(key, {
      status: 'IN_PROGRESS',
      statusCode: 102,
      createdAt: Date.now(),
      lockedUntil: Date.now() + 15000 // 15s lock
    });
  }

  public recordIdempotencyResponse(key: string, statusCode: number, response: any) {
    this.idempotencyLedger.set(key, {
      status: statusCode >= 200 && statusCode < 300 ? 'COMPLETED' : 'FAILED',
      statusCode,
      response,
      createdAt: Date.now(),
      lockedUntil: 0
    });
  }

  // Process Mock Payment
  public async processPayment(
    sessionId: string,
    idempotencyKey: string,
    scenario: PaymentScenario,
    cardDetails: { cardNumber: string; cardholderName: string; expiryDate: string; cvv: string },
    billingAddress: { name: string; email: string; street: string; city: string; state: string; zipCode: string }
  ): Promise<{ statusCode: number; body: any }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        statusCode: 404,
        body: { error: 'SESSION_NOT_FOUND', message: 'Checkout session not found or has been purged.' }
      };
    }

    if (session.status === 'EXPIRED') {
      return {
        statusCode: 410,
        body: { 
          error: 'RESERVATION_EXPIRED', 
          message: 'Your stock reservation lease expired. The items have been returned to inventory. Please re-reserve.',
          needsReReservation: true 
        }
      };
    }

    if (session.status === 'COMPLETED') {
      // Find existing order
      const existingOrder = Array.from(this.orders.values()).find(o => o.sessionId === sessionId);
      return {
        statusCode: 200,
        body: {
          duplicateDetected: true,
          message: 'Payment was already processed for this session. Replaying existing order.',
          order: existingOrder
        }
      };
    }

    if (session.status === 'CANCELLED') {
      return {
        statusCode: 400,
        body: { error: 'SESSION_CANCELLED', message: 'This checkout session was cancelled.' }
      };
    }

    // Mark session as PAYMENT_PENDING
    session.status = 'PAYMENT_PENDING';

    // Simulate Network / Gateway Behavior based on scenario
    if (scenario === 'timeout') {
      // Delay for 5.5 seconds to simulate an upstream payment gateway timeout
      await new Promise(r => setTimeout(r, 5500));
      session.status = 'ACTIVE_RESERVED'; // Keep reservation active so user can retry or cancel
      return {
        statusCode: 504,
        body: {
          error: 'GATEWAY_TIMEOUT',
          message: 'Simulated Gateway Timeout (504): The acquiring bank did not respond within the SLA threshold.',
          reservationRetained: true,
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
          canRetry: true
        }
      };
    }

    // Brief processing latency for realism
    await new Promise(r => setTimeout(r, 1200));

    if (scenario === 'insufficient_funds') {
      // Payment failed
      session.status = 'ACTIVE_RESERVED';
      return {
        statusCode: 402,
        body: {
          error: 'INSUFFICIENT_FUNDS',
          message: 'Simulated Card Decline: Insufficient account funds (Code: 51_insufficient_funds).',
          reservationRetained: true,
          canRetry: true
        }
      };
    }

    if (scenario === 'card_declined') {
      session.status = 'ACTIVE_RESERVED';
      return {
        statusCode: 402,
        body: {
          error: 'CARD_DECLINED',
          message: 'Simulated Card Decline: Do not honor / fraud suspicion (Code: 05_do_not_honor).',
          reservationRetained: true,
          canRetry: true
        }
      };
    }

    if (scenario === 'gateway_error') {
      session.status = 'ACTIVE_RESERVED';
      return {
        statusCode: 500,
        body: {
          error: 'INTERNAL_GATEWAY_ERROR',
          message: 'Simulated Gateway Fault (500): Cryptographic HSM handshake failure at payment network.',
          reservationRetained: true,
          canRetry: true
        }
      };
    }

    // Scenario is SUCCESS: Commit stock and generate order!
    for (const item of session.items) {
      const prod = this.products.get(item.productId);
      if (prod) {
        const prevStock = prod.stock;
        const prevReserved = prod.reservedQuantity;
        prod.stock -= item.quantity;
        prod.reservedQuantity = Math.max(0, prod.reservedQuantity - item.quantity);
        prod.availableStock = Math.max(0, prod.stock - prod.reservedQuantity);

        this.logAudit(
          prod.id,
          prod.name,
          'COMMITTED',
          item.quantity,
          prevStock,
          prod.stock,
          prevReserved,
          prod.reservedQuantity,
          `Payment captured. Permanent inventory deduction for Order checkout.`
        );
      }
    }

    session.status = 'COMPLETED';

    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const txId = `tx_${Math.random().toString(36).substring(2, 14)}`;
    const nowIso = new Date().toISOString();

    const order: Order = {
      id: orderId,
      sessionId: session.sessionId,
      idempotencyKey,
      createdAt: nowIso,
      items: session.items,
      subtotal: session.subtotal,
      tax: session.tax,
      shipping: session.shipping,
      total: session.total,
      status: 'PAID',
      payment: {
        transactionId: txId,
        status: 'CAPTURED',
        method: 'Visa / Mastercard Mock Gateway',
        last4: cardDetails.cardNumber.slice(-4) || '4242',
        paidAt: nowIso
      },
      customer: billingAddress,
      timeline: [
        {
          timestamp: new Date(session.createdAt).toISOString(),
          title: 'Stock Reservation Leased',
          description: `Inventory reserved under lease #${session.reservationId}.`,
          type: 'info'
        },
        {
          timestamp: nowIso,
          title: 'Payment Authorization & Capture',
          description: `Charge of $${session.total.toFixed(2)} successfully captured (TxID: ${txId}).`,
          type: 'success'
        },
        {
          timestamp: nowIso,
          title: 'Order Confirmed',
          description: `Order ${orderId} confirmed and queued for fulfillment.`,
          type: 'success'
        }
      ]
    };

    this.orders.set(orderId, order);

    return {
      statusCode: 200,
      body: {
        success: true,
        order,
        transactionId: txId,
        message: 'Payment captured successfully.'
      }
    };
  }

  // --- Post-Purchase: Cancel Order & Refund Simulation ---
  public cancelAndRefundOrder(orderId: string, reason = 'Customer requested cancellation'): {
    success: boolean;
    order?: Order;
    error?: string;
  } {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      return { success: false, error: 'Order is already cancelled / refunded.' };
    }

    if (order.status !== 'PAID') {
      return { success: false, error: `Cannot refund order with status "${order.status}".` };
    }

    const refundId = `rf_${Math.random().toString(36).substring(2, 14)}`;
    const nowIso = new Date().toISOString();

    // 1. Reverse stock in inventory
    for (const item of order.items) {
      const prod = this.products.get(item.productId);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock += item.quantity;
        prod.availableStock = prod.stock - prod.reservedQuantity;

        this.logAudit(
          prod.id,
          prod.name,
          'RESTORED_REFUND',
          item.quantity,
          prevStock,
          prod.stock,
          prod.reservedQuantity,
          prod.reservedQuantity,
          `Restored ${item.quantity} unit(s) due to Order ${order.id} refund (${refundId}).`
        );
      }
    }

    // 2. Update order payment metadata
    order.status = 'REFUNDED';
    order.payment.refundId = refundId;
    order.payment.refundedAt = nowIso;
    order.payment.refundAmount = order.total;

    order.timeline.push({
      timestamp: nowIso,
      title: 'Order Cancelled & Payment Refunded',
      description: `Full refund of $${order.total.toFixed(2)} issued to card ending in ${order.payment.last4} (Refund ID: ${refundId}). Restored ${order.items.reduce((s, i) => s + i.quantity, 0)} item(s) back to live inventory.`,
      type: 'warning'
    });

    return {
      success: true,
      order
    };
  }

  public getOrders(): Order[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderById(id: string): Order | null {
    return this.orders.get(id) || null;
  }

  public getAuditLogs(): InventoryAuditLog[] {
    return [...this.auditLogs].reverse();
  }

  public getSystemMetrics() {
    const products = Array.from(this.products.values());
    const totalInventoryUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const totalReservedUnits = products.reduce((acc, p) => acc + p.reservedQuantity, 0);
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === 'ACTIVE_RESERVED');
    const orders = Array.from(this.orders.values());
    const paidOrders = orders.filter(o => o.status === 'PAID');
    const refundedOrders = orders.filter(o => o.status === 'REFUNDED');

    return {
      totalInventoryUnits,
      totalReservedUnits,
      activeSessionsCount: activeSessions.length,
      totalOrdersCount: orders.length,
      paidOrdersCount: paidOrders.length,
      refundedOrdersCount: refundedOrders.length,
      reservationTtlMs: this.reservationTtlMs
    };
  }

  private logAudit(
    productId: string,
    productName: string,
    action: InventoryAuditLog['action'],
    quantity: number,
    previousStock: number,
    newStock: number,
    previousReserved: number,
    newReserved: number,
    reason: string
  ) {
    const log: InventoryAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      productId,
      productName,
      action,
      quantity,
      previousStock,
      newStock,
      previousReserved,
      newReserved,
      reason
    };
    this.auditLogs.push(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs.shift();
    }
  }
}

export const store = new InventoryAndPaymentStore();
