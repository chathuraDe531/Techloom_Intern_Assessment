# Task 01 – POS Order & Inventory System

A high-concurrency, transaction-safe Point-of-Sale (POS) Order & Inventory System built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). 

This system solves the classic e-commerce overselling problem using atomic MongoDB inventory reservations with a strict 5-minute stock reservation window, background expiration recovery, duplicate payment protection, and mock payment simulations.

---

## 🔗 Project Links

* **Live Frontend URL:** `[Will be updated upon deployment]`
* **Live Backend URL:** `[Will be updated upon deployment]`
* **GitHub Repository:** `[Will be updated upon deployment]`

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Vanilla CSS, Lucide Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **ODM:** Mongoose
* **Language:** JavaScript (ES6+ / CommonJS Backend, ES Modules Frontend)

---

## ✨ Core Features

1. **Product & Inventory Management (CRUD):**
   - Full RESTful APIs to create, read, update, and delete products.
   - Strict validations: product name required, price > 0, availableStock >= 0 (integer).
   - Real-time stock display across both client and server.

2. **Cart Management:**
   - Frontend cart with reactive quantity adjustment, item removal, subtotal & tax calculation.
   - Client-side stock ceiling prevents requesting more than what is currently in stock.

3. **Concurrency-Safe Atomic Stock Reservation:**
   - When checkout begins, requested quantities are reserved atomically.
   - Eliminates race conditions (TOCTOU) using atomic query filters `{ availableStock: { $gte: quantity } }` and `$inc: { availableStock: -quantity }`.
   - Guaranteed: Stock can **never drop below zero**.

4. **5-Minute Stock Reservation & Automatic Recovery:**
   - Every checkout creates a reservation linked to the order with `expiresAt: Date.now() + 5 minutes`.
   - Server-side background worker polls periodically to automatically transition expired reservations and return reserved stock to inventory.
   - Lazy validation: Payment attempts against expired reservations are rejected immediately, restoring stock on demand.

5. **State Machine & Valid Order Transitions:**
   - Strict status enforcement:
     - `PENDING` → `RESERVED`
     - `RESERVED` → `PAID` (on successful payment)
     - `RESERVED` → `FAILED` (on failed payment, restoring stock immediately)
     - `RESERVED` → `EXPIRED` (on 5-minute timeout, restoring stock)
     - `RESERVED` → `CANCELLED` (user cancellation, releasing stock)
     - `PAID` → `CANCELLED` (simulates refund, ensures stock is not restored twice)

6. **Duplicate Payment & Idempotency Protection:**
   - Atomic transition prevents the same order from being paid twice.
   - Idempotency key per checkout prevents duplicate order creation for repeated clicks.

7. **Mock Payment Simulation:**
   - Three simulated payment outcomes:
     - 🟩 **SUCCESS**: Confirms payment, marks order `PAID`, converts reservation, stock permanently consumed.
     - 🟥 **FAILED**: Rejects payment, marks order `FAILED`, releases reservation, stock immediately restored.
     - 🟨 **TIMEOUT**: Simulates network timeout, sets payment status to `TIMEOUT`, allows 5-minute reservation timer to auto-expire and recover stock.

---

## 📁 Project Structure

```text
task-01/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ReservationTimer.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductManagementPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   └── OrderResultPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   └── .env.example
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── reservationController.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Reservation.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── reservationRoutes.js
│   ├── services/
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   ├── reservationService.js
│   │   └── expirationService.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── response.js
│   ├── tests/
│   │   └── concurrency-test.js
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
└── README.md
```

---

## 🔐 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pos_inventory
NODE_ENV=development
```
*(Note: If a local MongoDB instance is not detected, the server automatically starts an in-memory MongoDB replica set so you can run and test immediately without configuring a database!)*

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher recommended, tested on v22)
- npm (v9 or higher)

### 1. Clone Repository & Navigate
```bash
git clone <repository_url>
cd Techloom_Intern_Assessment/task-01
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
The backend will launch at `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd task-01/client
npm install
cp .env.example .env
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

## 📡 REST API Documentation

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve list of all products |
| `GET` | `/api/products/:id` | Retrieve single product details |
| `POST` | `/api/products` | Create product (`{ name, price, availableStock }`) |
| `PUT` | `/api/products/:id` | Update product details or stock |
| `DELETE` | `/api/products/:id` | Delete a product |

### Orders & Checkout
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Checkout cart, atomically reserves stock for 5 min (`{ items, idempotencyKey }`) |
| `GET` | `/api/orders/:id` | Retrieve order details & reservation status |
| `POST` | `/api/orders/:id/cancel` | Cancel order; restores stock if reserved, simulates refund if paid |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments` | Simulate payment (`{ orderId, outcome: "SUCCESS" \| "FAILED" \| "TIMEOUT" }`) |
| `GET` | `/api/payments/:orderId` | Get payment transaction history for an order |

### Reservations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reservations/:orderId` | Get active or past reservation info for an order |

---

## 🧠 Deep-Dive: Concurrency & Technical Mechanisms

### 1. Concurrency Protection & Preventing Overselling
A common beginner bug is reading the stock and then updating it in separate queries:
```javascript
// ❌ UNSAFE (Causes Overselling under concurrent load):
const product = await Product.findById(productId);
if (product.availableStock >= requestedQty) {
  product.availableStock -= requestedQty;
  await product.save();
}
```
If two requests arrive at the same time when stock is 5 (Request A wants 4, Request B wants 3), both will read `availableStock = 5`, both will proceed, and stock will drop to -2 (overselling).

**How our system solves it safely:**
```javascript
// ✅ CONCURRENCY-SAFE (MongoDB Document-Level Atomic Filter):
const updatedProduct = await Product.findOneAndUpdate(
  {
    _id: productId,
    availableStock: { $gte: requestedQty }, // Guard predicate evaluated with write lock
  },
  {
    $inc: { availableStock: -requestedQty }, // Atomic decrement
  },
  { new: true, session }
);
```
**Why this is 100% safe:**
- **Document-Level Lock:** MongoDB write operations on a single document are atomic. MongoDB acquires a write lock before evaluating the filter.
- **Atomic Guard:** Even if 100 concurrent requests arrive, MongoDB evaluates `{ availableStock: { $gte: requestedQty } }` sequentially.
- If Request A (4 units) decrements stock from 5 to 1, Request B (3 units) evaluates next. Its filter `{ availableStock: { $gte: 3 } }` evaluates to `false` because stock is now 1. MongoDB returns `null` and modifies 0 documents.
- Stock **never drops below zero**, completely preventing overselling.

### 2. 5-Minute Stock Reservation & Server-Side Recovery
- When checkout starts, a `Reservation` document is created with `expiresAt: new Date(Date.now() + 5 * 60 * 1000)`.
- **Background Worker:** `expirationService.js` polls every 10 seconds. When `expiresAt <= now` on an `ACTIVE` reservation:
  1. Atomically updates reservation to `EXPIRED`.
  2. Restores inventory stock using `$inc: { availableStock: item.quantity }`.
  3. Updates order status to `EXPIRED`.
- **Lazy Check:** When a user attempts to pay, `paymentService.js` checks `new Date() >= reservation.expiresAt`. If expired, it triggers expiration immediately and rejects the payment, guaranteeing millisecond accuracy.

### 3. Duplicate Payment Protection
- When a payment request is received, the system checks whether the order is already in `PAID` status.
- An atomic state transition is performed:
  ```javascript
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, status: 'RESERVED' },
    { $set: { status: 'PAID', paymentStatus: 'SUCCESS' } },
    { new: true }
  );
  ```
  If another payment attempt arrives at the same millisecond, only the first request matches `status: 'RESERVED'`. The second attempt receives `null` and is safely rejected with `400 Bad Request: Order is already paid`.

---

## 🧪 Testing Instructions

### Automated Concurrency Test
We built an automated concurrency test script that simulates simultaneous requests competing for limited stock:
```bash
cd task-01/server
npm run test:concurrency
```
**What the test verifies:**
1. Creates a product with `availableStock = 5`.
2. Fires two simultaneous requests (`Request A` wants 4, `Request B` wants 3) using `Promise.allSettled`.
3. Asserts that exactly one request succeeds and one fails with `"Insufficient stock"`.
4. Asserts that final stock in database is 1 (non-negative).
5. Asserts duplicate payment protection by attempting to pay for the successful order a second time.

### Manual Step-by-Step Test Guide
1. **Product CRUD:** Navigate to "Manage Inventory" tab. Create a product (e.g., "Gaming Mouse", Price: 49.99, Stock: 5). Edit its price or stock, and verify updates in the table.
2. **Add to Cart:** Navigate to "Store Products". Add 2 units of "Gaming Mouse". Notice the stock badge and cart counter.
3. **Checkout & Reservation:** Open Cart, click "Proceed to Checkout", then click "Reserve Stock & Proceed to Payment".
   - Notice the stock for "Gaming Mouse" in the store decreases from 5 to 3 immediately.
   - Notice the live 5-minute countdown timer on the payment page.
4. **Successful Payment:** Click "Pay Successfully". Notice the order transitions to `PAID`, reservation is converted, and stock remains deducted.
5. **Duplicate Payment Check:** On the Order Result page, click "Test Duplicate Payment Protection". Observe the server blocking the second payment attempt.
6. **Failed Payment Simulation:** Add 1 item to cart, start checkout, and on the payment page click "Simulate Payment Failure".
   - Notice order status becomes `FAILED` and the stock is immediately restored in the store.
7. **Payment Timeout & 5-Minute Expiry:** Start a checkout and either click "Simulate Payment Timeout" or wait for the 5-minute timer to reach 00:00.
   - The background worker expires the reservation and automatically restores stock to the inventory.
8. **Order Cancellation:** Start a checkout, click "Cancel Order (Release Stock)" on the payment page. Verify the order is cancelled and reserved stock is restored.

---

## 🌐 Deployment Instructions

### Deploy Backend (e.g. Render / Railway / Heroku)
1. Push code to GitHub.
2. Create a new Web Service pointing to `task-01/server`.
3. Set environment variables:
   - `PORT=5000`
   - `MONGODB_URI=<your_mongodb_atlas_connection_string>`
   - `NODE_ENV=production`
4. Build command: `npm install`
5. Start command: `node server.js`

### Deploy Frontend (e.g. Vercel / Netlify)
1. Create a new Project pointing to `task-01/client`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable:
   - `VITE_API_URL=https://<your-backend-domain>/api`

### Deploy the Full Stack with Docker Compose
The repository also includes a production container setup for MongoDB, the API, and the built React client:

```bash
docker compose up --build -d
```

Open the application at `http://localhost:5173`. The API is available at `http://localhost:5000` and MongoDB data is persisted in the `mongo-data` Docker volume.

To stop the deployment:

```bash
docker compose down
```
