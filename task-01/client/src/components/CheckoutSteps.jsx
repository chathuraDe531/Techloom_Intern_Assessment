import React from 'react';
import { ShoppingCart, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';

export default function CheckoutSteps({ currentStep }) {
  const steps = [
    { id: 'cart', label: 'Cart Review', icon: ShoppingCart, num: 1 },
    { id: 'checkout', label: 'Stock Reservation', icon: ShieldCheck, num: 2 },
    { id: 'payment', label: 'Payment', icon: CreditCard, num: 3 },
    { id: 'result', label: 'Confirmation', icon: CheckCircle2, num: 4 },
  ];

  const getStepStatus = (stepId) => {
    const order = ['cart', 'checkout', 'payment', 'result'];
    const currentIndex = order.indexOf(currentStep);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="checkout-stepper-container">
      <div className="checkout-stepper">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div className={`step-item ${status}`}>
                <div className="step-circle">
                  {status === 'completed' ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <div className="step-label">
                  <span className="step-num">Step {step.num}</span>
                  <span className="step-name">{step.label}</span>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`step-line ${status === 'completed' ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
