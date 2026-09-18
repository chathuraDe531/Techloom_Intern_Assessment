export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Audio' | 'Wearables' | 'Footwear' | 'Lifestyle' | 'Smart Tech';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  imageUrl: string;
  stock: number;
  reservedQuantity: number;
  availableStock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutSessionItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CheckoutSession {
  sessionId: string;
  reservationId: string;
  items: CheckoutSessionItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'ACTIVE_RESERVED' | 'PAYMENT_PENDING' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
  expiresAt: number;
  idempotencyKey: string;
}

export type PaymentScenario = 
  | 'success' 
  | 'card_declined' 
  | 'insufficient_funds' 
  | 'timeout' 
  | 'gateway_error';

export interface PaymentRequest {
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
}

export interface OrderTimelineEvent {
  timestamp: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Order {
  id: string;
  sessionId: string;
  idempotencyKey: string;
  createdAt: string;
  items: CheckoutSessionItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'PAID' | 'PAYMENT_FAILED' | 'CANCELLED' | 'REFUNDED';
  payment: {
    transactionId: string;
    status: string;
    method: string;
    last4: string;
    paidAt: string;
    refundId?: string;
    refundedAt?: string;
    refundAmount?: number;
  };
  customer: {
    name: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  timeline: OrderTimelineEvent[];
}

export interface InventoryAuditLog {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  action: 'RESERVED' | 'RELEASED_EXPIRY' | 'RELEASED_MANUAL' | 'COMMITTED' | 'RESTORED_REFUND';
  quantity: number;
  previousStock: number;
  newStock: number;
  previousReserved: number;
  newReserved: number;
  reason: string;
}
