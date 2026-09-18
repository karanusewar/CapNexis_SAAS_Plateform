import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Rocket, Shield, X, ArrowRight } from 'lucide-react';
import { useAuth } from './FirebaseProvider';

// Cashfree instance is available globally via script tag
declare const Cashfree: any;

interface PricingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Pricing({ isOpen, onClose }: PricingProps) {
  const { user, upgradeUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Fundraising Starter',
      price: 999,
      tokens: 10,
      description: 'Perfect for early-stage founders refining their first narrative.',
      features: [
        '10 Institutional Analysis Tokens',
        'Basic Success Probability Matrix',
        'Critical Vulnerability Detection',
        'PDF Export (Standard)',
      ],
      icon: <Rocket className="w-6 h-6 text-[var(--color-brand-cyan)]" />,
      color: 'cyan'
    },
    {
      id: 'pro',
      name: 'Founder Pro Pass',
      price: 1499,
      tokens: 999,
      description: 'The complete arsenal for a serious institutional fundraise.',
      features: [
        'AI Rewrite Protocol (Slide-by-Slide)',
        'Full Institutional Deal Memo Export',
        'Syndicate Matching Priority',
        'Advanced Radar Success Matrix',
      ],
      icon: <Zap className="w-6 h-6 text-[var(--color-brand-pink)]" />,
      color: 'pink',
      recommended: true
    }
  ];

  const handlePayment = async (plan: typeof plans[0]) => {
    if (!user) {
      setError("Please sign in with Google to upgrade your account!");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create order on backend
      const response = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          customerId: user.uid,
          customerPhone: '9999999999',
          orderId: `order_${user.uid}_${Date.now()}`
        })
      });

      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Initialize Cashfree
      const cashfree = Cashfree({
        mode: "production" 
      });

      const checkoutOptions = {
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_modal",
      };

      // 3. Open Checkout
      cashfree.checkout(checkoutOptions).then(async (result: any) => {
        if (result.error) {
          setError(result.error.message);
          setIsProcessing(false);
        } else if (result.redirect) {
          console.log("Redirected...");
        } else if (result.paymentDetails) {
          // Verify on backend
          const verifyRes = await fetch(`/api/verify-cashfree-payment/${orderData.order_id}`);
          const verifyData = await verifyRes.json();

          if (verifyData.order_status === 'PAID') {
            await upgradeUser(plan.tokens);
            alert("Payment Successful! Your account has been upgraded.");
            onClose();
          } else {
            setError("Payment verification failed. Please contact support.");
          }
          setIsProcessing(false);
        }
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 max-w-4xl w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-brand-cyan)] via-[var(--color-brand-pink)] to-[var(--color-brand-cyan)]"></div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Select Your Arsenal</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Stop guessing. Start iterating with the same metrics Institutional Investors use to judge your narrative.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-950/30 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                    plan.recommended 
                      ? 'bg-slate-800/40 border-[var(--color-brand-pink)] shadow-[0_0_40px_rgba(247,37,133,0.1)] scale-105' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-brand-pink)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-2xl bg-slate-950 border ${plan.color === 'pink' ? 'border-[var(--color-brand-pink)]/30' : 'border-[var(--color-brand-cyan)]/30'}`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-slate-400 text-xs">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <span className="text-4xl font-black text-white">₹{plan.price}</span>
                    <span className="text-slate-500 text-sm ml-2">/ one-time</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.color === 'pink' ? 'text-[var(--color-brand-pink)]' : 'text-[var(--color-brand-cyan)]'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>

                  <button
                    disabled={isProcessing}
                    onClick={() => handlePayment(plan)}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                      plan.recommended 
                        ? 'bg-[var(--color-brand-pink)] hover:bg-[var(--color-brand-pink)]/90 text-white shadow-[0_0_20px_rgba(247,37,133,0.3)]' 
                        : 'bg-white hover:bg-slate-100 text-slate-950'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? 'Processing...' : `Upgrade Now`}
                    {!isProcessing && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-8 opacity-50 grayscale">
               <Shield className="w-12 h-12 text-slate-500" />
               <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Payments via</p>
                  <p className="text-sm font-black text-white italic">Cashfree Payments</p>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
