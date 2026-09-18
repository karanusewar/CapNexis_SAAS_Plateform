import express from "express";

const app = express();
app.use(express.json());

// Cashfree Configuration
const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID?.trim(),
  secretKey: process.env.CASHFREE_SECRET_KEY?.trim(),
  env: (process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION').toUpperCase().trim()
};

const CASHFREE_BASE_URL = CASHFREE_CONFIG.env === 'PRODUCTION' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

// API Routes
app.post("/api/create-cashfree-order", async (req, res) => {
  try {
    const { amount, customerId, customerPhone, orderId } = req.body;
    console.log(`Cashfree Request: ${CASHFREE_BASE_URL}/orders`);
    console.log(`App ID: ${CASHFREE_CONFIG.appId?.substring(0, 5)}...`);
    console.log(`Secret Key Prefix: ${CASHFREE_CONFIG.secretKey?.substring(0, 10)}...`);

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_CONFIG.appId!,
        'x-client-secret': CASHFREE_CONFIG.secretKey!,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: orderId || `order_${Date.now()}`,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerId,
          customer_phone: customerPhone || '9999999999'
        }
      })
    });

    const data = await response.json();
    console.log("Cashfree Response Status:", response.status);
    if (!response.ok) {
      console.error("Cashfree Error Data:", data);
      // Return the detailed error message from Cashfree to the frontend
      return res.status(response.status).json({ 
        error: data.message || 'Failed to create order',
        code: data.code || 'UNKNOWN_ERROR',
        details: data // Return full object for maximum debugging
      });
    }

    res.json(data);
  } catch (error: any) {
    console.error("Cashfree Order Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/verify-cashfree-payment/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_CONFIG.appId!,
        'x-client-secret': CASHFREE_CONFIG.secretKey!,
        'x-api-version': '2023-08-01'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to verify payment');

    res.json(data);
  } catch (error: any) {
    console.error("Cashfree Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Export the Express app for Vercel
export default app;
