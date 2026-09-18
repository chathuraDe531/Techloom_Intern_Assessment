import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { store } from './server/store.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Endpoints ---

  // 1. Product Discovery
  app.get('/api/products', (req: Request, res: Response) => {
    try {
      const { search, category, inStockOnly, minPrice, maxPrice, sort } = req.query;
      const products = store.getAllProducts(
        typeof search === 'string' ? search : undefined,
        typeof category === 'string' ? category : undefined,
        inStockOnly === 'true',
        minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice ? parseFloat(maxPrice as string) : undefined,
        typeof sort === 'string' ? sort : undefined
      );
      res.json({ products });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    try {
      const product = store.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ product });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch product', details: err.message });
    }
  });

  // 2. Stock Reservation Flow
  app.post('/api/checkout/reserve', (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Cart items array is required.' });
      }

      const result = store.reserveStock(items);
      if (!result.success) {
        return res.status(409).json({
          error: result.error,
          insufficientItem: result.insufficientItem
        });
      }

      res.status(201).json({
        success: true,
        session: result.session,
        message: 'Stock successfully reserved. Complete payment before lease expires.'
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Reservation failed', details: err.message });
    }
  });

  app.post('/api/checkout/release', (req: Request, res: Response) => {
    try {
      const { sessionId, reason } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required.' });
      }

      const released = store.releaseReservation(sessionId, reason || 'User abandoned checkout');
      res.json({ success: released, message: released ? 'Reservation released.' : 'Session not found or already closed.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to release reservation', details: err.message });
    }
  });

  app.get('/api/checkout/session/:id', (req: Request, res: Response) => {
    try {
      const session = store.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      const remainingMs = Math.max(0, session.expiresAt - Date.now());
      res.json({ session, remainingSeconds: Math.ceil(remainingMs / 1000) });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load session', details: err.message });
    }
  });

  // 3. Mock Payment Gateway with Idempotency & Simulation Scenarios
  app.post('/api/payment/process', async (req: Request, res: Response) => {
    try {
      const { sessionId, idempotencyKey, scenario = 'success', cardDetails, billingAddress } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Missing required field: sessionId' });
      }

      if (!idempotencyKey) {
        return res.status(400).json({ error: 'Missing required field: idempotencyKey' });
      }

      // Check Idempotency Ledger
      const existingRecord = store.getIdempotencyRecord(idempotencyKey);
      if (existingRecord) {
        if (existingRecord.status === 'IN_PROGRESS') {
          // Concurrent duplicate payment attempt detected
          return res.status(409).json({
            error: 'CONCURRENT_PAYMENT_IN_PROGRESS',
            message: 'A payment request with this idempotency key is already currently executing. Please wait for completion.'
          });
        }

        if (existingRecord.status === 'COMPLETED') {
          // Safe replay of completed payment
          return res.status(200).json({
            ...existingRecord.response,
            idempotentReplay: true,
            message: 'Duplicate payment request detected and prevented. Returning previously confirmed order.'
          });
        }
      }

      // Lock idempotency key for in-flight protection
      store.lockIdempotencyKey(idempotencyKey);

      // Process payment
      const outcome = await store.processPayment(
        sessionId,
        idempotencyKey,
        scenario,
        cardDetails || {
          cardNumber: '4242424242424242',
          cardholderName: 'Jane Doe',
          expiryDate: '12/28',
          cvv: '123'
        },
        billingAddress || {
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          street: '123 Market St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105'
        }
      );

      // Record final outcome in idempotency ledger
      store.recordIdempotencyResponse(idempotencyKey, outcome.statusCode, outcome.body);

      return res.status(outcome.statusCode).json(outcome.body);
    } catch (err: any) {
      res.status(500).json({ error: 'Payment processing crashed', details: err.message });
    }
  });

  // 4. Order Management & History
  app.get('/api/orders', (req: Request, res: Response) => {
    try {
      const orders = store.getOrders();
      res.json({ orders });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
    }
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    try {
      const order = store.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ order });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch order', details: err.message });
    }
  });

  // 5. Post-Purchase Flow: Cancel & Refund Order
  app.post('/api/orders/:id/cancel', (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      const result = store.cancelAndRefundOrder(req.params.id, reason);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        order: result.order,
        message: 'Order successfully cancelled. Full refund issued and reserved stock returned to live inventory.'
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Cancellation failed', details: err.message });
    }
  });

  // 6. System Diagnostics & Audit Logs
  app.get('/api/system/metrics', (req: Request, res: Response) => {
    try {
      const metrics = store.getSystemMetrics();
      res.json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch system metrics', details: err.message });
    }
  });

  app.get('/api/system/audit-logs', (req: Request, res: Response) => {
    try {
      const logs = store.getAuditLogs();
      res.json({ logs });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
    }
  });

  app.post('/api/system/reset', (req: Request, res: Response) => {
    try {
      store.resetStore();
      res.json({ success: true, message: 'Store database and inventory have been reset to default state.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Reset failed', details: err.message });
    }
  });

  // --- Vite / Frontend Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Commerce Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot failure:', err);
});
