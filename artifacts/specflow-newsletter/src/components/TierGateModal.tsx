import React, { useState } from "react";
import { useTierFeatures } from "../hooks/useTierFeatures";

interface TierGateModalProps {
  isOpen: boolean;
  featureKey: string;
  featureName: string;
  currentTier: string;
  onClose: () => void;
  onUpgrade: (tier: string) => void;
}

const TIER_INFO = {
  pro: {
    price: 29,
    benefits: [
      "50 AI commands per month",
      "100 document downloads",
      "5 custom templates",
      "Advanced analytics",
      "100 API calls/month",
      "Team collaboration (1 seat)",
    ],
  },
  max: {
    price: 149,
    benefits: [
      "500 AI commands per month",
      "1000 document downloads",
      "Unlimited custom templates",
      "Enterprise analytics",
      "Unlimited API calls",
      "10 team seats",
      "Custom branding",
      "Priority support",
    ],
  },
  incubator: {
    price: "Custom",
    benefits: [
      "Unlimited everything",
      "Unlimited team members",
      "Dedicated account manager",
      "White-label option",
      "Custom integrations",
    ],
  },
};

export function TierGateModal({
  isOpen,
  featureKey,
  featureName,
  currentTier,
  onClose,
  onUpgrade,
}: TierGateModalProps) {
  const { getUpgradeRequired } = useTierFeatures(currentTier);
  const requiredTier = getUpgradeRequired(featureKey);

  if (!isOpen || !requiredTier) return null;

  const availableTiers = ["pro", "max", "incubator"].filter(
    (t) => t !== currentTier && TIER_INFO[t as keyof typeof TIER_INFO]
  );

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl shadow-xl max-w-2xl w-full mx-4 border border-border">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-2xl font-bold text-foreground">
            Upgrade to {requiredTier === "pro" ? "Pro" : requiredTier === "max" ? "Max" : "Incubator"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {featureName} is available on higher tiers
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTiers.map((tier) => {
            const info = TIER_INFO[tier as keyof typeof TIER_INFO];
            return (
              <div
                key={tier}
                className="border border-border rounded-2xl p-4 hover:border-primary/50 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-foreground capitalize">
                    {tier}
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      ${info.price}
                    </div>
                    {typeof info.price === "number" && (
                      <div className="text-sm text-muted-foreground">/month</div>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {info.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="text-sm text-foreground/80 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    onUpgrade(tier);
                    onClose();
                  }}
                  className={`w-full py-2 px-4 rounded-xl font-medium transition ${
                    tier === requiredTier
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-xl font-medium"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
