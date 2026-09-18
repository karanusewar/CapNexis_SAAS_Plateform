import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middleware for parsing JSON bodies
app.use(express.json({ limit: '50mb' }));

// Cashfree Configuration
const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  env: process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION'
};

const CASHFREE_BASE_URL = CASHFREE_CONFIG.env === 'PRODUCTION' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

// API Routes
app.post("/api/create-cashfree-order", async (req, res) => {
  try {
    const { amount, customerId, customerPhone, orderId } = req.body;

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
          customer_phone: customerPhone || '9999999999' // Placeholder if not provided
        }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create order');

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


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
