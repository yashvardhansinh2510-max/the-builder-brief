import React, { useState, useEffect } from "react";

export interface UpgradePromptProps {
  isEligible: boolean;
  currentTier: "free" | "pro" | "max";
  targetTier: "pro" | "max" | "incubator";
  triggerType: string;
  offerId: string;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isEligible,
  currentTier,
  targetTier,
  triggerType,
  offerId,
  onUpgrade,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(isEligible);

  if (!isVisible) return null;

  const getTierInfo = () => {
    switch (targetTier) {
      case "pro":
        return {
          title: "Ready for Pro?",
          description:
            "You've shown strong engagement with the scorecard. Pro includes the complete playbook and founder network access.",
          cta: "Unlock Pro",
          price: "$300/year",
        };
      case "max":
        return {
          title: "Time to Accelerate",
          description:
            "You've hit key milestones. Max tier includes founder advisor matching, custom strategy sessions, and competitive intelligence.",
          cta: "Explore Max",
          price: "$5,000/year",
        };
      case "incubator":
        return {
          title: "Join Incubator",
          description:
            "You're in the top 5% of founders we work with. Incubator means capital introductions, portfolio partnerships, and co-founder matching.",
          cta: "Learn More",
          price: "Invitation-only",
        };
      default:
        return {
          title: "Upgrade Available",
          description: "You qualify for an upgrade.",
          cta: "Upgrade Now",
          price: "Special offer",
        };
    }
  };

  const tierInfo = getTierInfo();

  const handleUpgrade = async () => {
    try {
      await fetch(`/api/upgrades/claim/${offerId}`, {
        method: "POST",
        body: JSON.stringify({ offerId }),
      });
      onUpgrade();
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-6 max-w-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {tierInfo.title}
        </h3>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <p className="text-gray-600 mb-4 text-sm">{tierInfo.description}</p>

      <div className="mb-4 text-center">
        <div className="text-2xl font-bold text-gray-900">
          {tierInfo.price}
        </div>
        {targetTier !== "incubator" && (
          <div className="text-xs text-gray-500 mt-1">Limited time offer</div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleUpgrade}
          className="flex-1 bg-black text-white py-2 px-4 rounded-md font-medium hover:bg-gray-800 transition"
        >
          {tierInfo.cta}
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition"
        >
          Maybe Later
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Offer expires in 7 days. No credit card required.
      </div>
    </div>
  );
};
