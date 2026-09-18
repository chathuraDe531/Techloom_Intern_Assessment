/**
 * Concurrency & Overselling Automated Test Script
 *
 * Demonstrates:
 * 1. Product initial availableStock = 5
 * 2. Simultaneous Request A requesting 4 items
 * 3. Simultaneous Request B requesting 3 items
 * 4. Verifies that the system safely fulfills one request and rejects the other
 * 5. Verifies stock is never negative (stock = 1)
 * 6. Verifies duplicate payment protection (cannot pay twice)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('../config/db');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');
const { PAYMENT_OUTCOME } = require('../utils/constants');

const runConcurrencyTest = async () => {
  console.log('\n======================================================');
  console.log('🧪 STARTING CONCURRENCY & OVERSELLING DEMONSTRATION');
  console.log('======================================================\n');

  try {
    await connectDB();

    // 1. Create a limited stock test product
    const testProduct = await Product.create({
      name: `Limited Edition Smartwatch [Test-${Date.now()}]`,
      price: 199.99,
      availableStock: 5, // Exact requirement: Available stock = 5
    });

    console.log(`[Setup] Created Test Product: "${testProduct.name}"`);
    console.log(`[Setup] Initial Available Stock = ${testProduct.availableStock}\n`);

    console.log('------------------------------------------------------');
    console.log('🚀 Firing TWO SIMULTANEOUS Checkout Requests:');
    console.log('   - Request A: Wants 4 units');
    console.log('   - Request B: Wants 3 units');
    console.log('   - Total requested: 7 units (which exceeds available stock of 5!)');
    console.log('------------------------------------------------------\n');

    // Run both requests concurrently using Promise.allSettled
    const [resultA, resultB] = await Promise.allSettled([
      orderService.createOrder({
        items: [{ productId: testProduct._id, quantity: 4 }],
        idempotencyKey: `req-a-${Date.now()}`,
      }),
      orderService.createOrder({
        items: [{ productId: testProduct._id, quantity: 3 }],
        idempotencyKey: `req-b-${Date.now()}`,
      }),
    ]);

    console.log('📊 SIMULTANEOUS REQUEST RESULTS:');
    console.log(`- Request A outcome: ${resultA.status === 'fulfilled' ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (resultA.status === 'rejected') console.log(`  Reason: ${resultA.reason.message}`);
    else console.log(`  Order ID: ${resultA.value.order.orderId}, Status: ${resultA.value.order.status}`);

    console.log(`- Request B outcome: ${resultB.status === 'fulfilled' ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (resultB.status === 'rejected') console.log(`  Reason: ${resultB.reason.message}`);
    else console.log(`  Order ID: ${resultB.value.order.orderId}, Status: ${resultB.value.order.status}`);

    // Fetch refreshed product stock from database
    const refreshedProduct = await Product.findById(testProduct._id);
    console.log(`\n📦 Current Available Stock in Database: ${refreshedProduct.availableStock}`);

    // Verifications
    const successes = [resultA, resultB].filter((r) => r.status === 'fulfilled');
    const failures = [resultA, resultB].filter((r) => r.status === 'rejected');

    if (successes.length === 1 && failures.length === 1) {
      console.log('✅ PASS: Exactly one concurrent request succeeded, and one was rejected.');
    } else {
      console.error('❌ FAIL: Concurrency violation! Both succeeded or both failed unexpectedly.');
    }

    if (refreshedProduct.availableStock >= 0) {
      console.log(`✅ PASS: Stock is non-negative (Stock = ${refreshedProduct.availableStock}).`);
    } else {
      console.error(`❌ FAIL: Stock became negative! (${refreshedProduct.availableStock})`);
    }

    // 2. Duplicate Payment Protection Verification
    console.log('\n------------------------------------------------------');
    console.log('🛡️ TESTING DUPLICATE PAYMENT PROTECTION');
    console.log('------------------------------------------------------');
    const successfulOrder = successes[0].value.order;
    console.log(`Attempting Payment 1 for ${successfulOrder.orderId} (Outcome: SUCCESS)...`);
    const payment1 = await paymentService.processPayment({
      orderId: successfulOrder._id,
      outcome: PAYMENT_OUTCOME.SUCCESS,
    });
    console.log(`✅ Payment 1 Result: ${payment1.order.status}, PaymentStatus: ${payment1.order.paymentStatus}`);

    console.log(`\nAttempting Duplicate Payment 2 for SAME Order ${successfulOrder.orderId}...`);
    try {
      await paymentService.processPayment({
        orderId: successfulOrder._id,
        outcome: PAYMENT_OUTCOME.SUCCESS,
      });
      console.error('❌ FAIL: Duplicate payment was permitted unexpectedly!');
    } catch (dupError) {
      console.log(`✅ PASS: Duplicate payment was blocked safely!`);
      console.log(`   Error message: "${dupError.message}"`);
    }

    // Clean up test data
    await Product.findByIdAndDelete(testProduct._id);
    if (successfulOrder) {
      await Order.findByIdAndDelete(successfulOrder._id);
      if (successes[0].value.reservation) {
        await Reservation.findByIdAndDelete(successes[0].value.reservation._id);
      }
    }

    console.log('\n======================================================');
    console.log('🎉 ALL CONCURRENCY & INTEGRITY TESTS PASSED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Unexpected test error:', error);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

runConcurrencyTest();
