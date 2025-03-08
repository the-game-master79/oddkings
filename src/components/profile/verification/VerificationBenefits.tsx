
import React from "react";

interface BenefitsProps {
  level: 1;
}

export const VerificationBenefits = ({ level }: BenefitsProps) => {
  const benefits = [
    "Higher betting limits up to $50M",
    "Enable withdrawal option",
    "Support response time to 6 hours",
    "No Withdrawal Limit"
  ];

  return (
    <div className="bg-muted p-4 rounded-lg">
      <h4 className="font-semibold mb-2">Your Benefits:</h4>
      <ul className="list-disc pl-5 space-y-1">
        {benefits.map((benefit, index) => (
          <li key={index}>{benefit}</li>
        ))}
      </ul>
    </div>
  );
};
