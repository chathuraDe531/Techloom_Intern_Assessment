require('dotenv').config();
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const { startExpirationWorker, stopExpirationWorker } = require('./services/expirationService');
const Product = require('./models/Product');

const PORT = process.env.PORT || 5000;

const STARTER_PRODUCTS = [
  { name: 'Nova X Smartphone', price: 125000, availableStock: 12 },
  { name: 'Studio Noise-Cancelling Headphones', price: 34000, availableStock: 10 },
  { name: 'Pulse Smart Watch', price: 14500, availableStock: 20 },
  { name: 'Mechanical Gaming Keyboard', price: 18500, availableStock: 15 },
  { name: 'Precision Wireless Mouse', price: 6500, availableStock: 25 },
  { name: '27-inch 4K Monitor', price: 89000, availableStock: 6 },
  { name: 'Premium Cotton Polo Shirt', price: 4200, availableStock: 30 },
  { name: 'Canvas Everyday Sneakers', price: 9800, availableStock: 18 },
  { name: 'Everyday Travel Backpack', price: 12500, availableStock: 14 },
  { name: 'Artisan Coffee Beans', price: 3200, availableStock: 40 },
  { name: 'Matcha Green Tea', price: 2400, availableStock: 28 },
  { name: 'Dark Chocolate Snack Box', price: 1800, availableStock: 35 },
  { name: 'The Midnight Library Novel', price: 4200, availableStock: 16 },
  { name: 'Minimal Daily Planner Notebook', price: 2100, availableStock: 24 },
  { name: 'Warm Glow Desk Lamp', price: 7600, availableStock: 9 },
  { name: 'Handmade Ceramic Vase', price: 5400, availableStock: 7 },
];

const seedStarterProducts = async () => {
  const productCount = await Product.countDocuments();
  if (productCount > 0) return;

  await Product.insertMany(STARTER_PRODUCTS);
  console.log(`Seeded ${STARTER_PRODUCTS.length} starter products across the store categories.`);
};

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    await seedStarterProducts();

    // Start background worker for 5-minute reservation auto-expiration
    startExpirationWorker(10000); // polls every 10 seconds

    const server = app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 POS Server running on port ${PORT}`);
      console.log(`🌍 Health check: http://localhost:${PORT}/health`);
      console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
      console.log(`=============================================`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      stopExpirationWorker();
      server.close(async () => {
        console.log('HTTP server closed.');
        await closeDB();
        console.log('Database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
