import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface MilestoneProgressProps {
  currentMRR?: number;
  activeUsers?: number;
  featureShipped?: boolean;
  milestonesHit: number;
  maxUpgradeEligible: boolean;
  onMaxClickRedirect?: () => void;
}

const REVENUE_TARGET = 50000; // $500 in cents
const USERS_TARGET = 500;

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  currentMRR = 0,
  activeUsers = 0,
  featureShipped = false,
  milestonesHit,
  maxUpgradeEligible,
  onMaxClickRedirect,
}) => {
  const [displayedMilestones, setDisplayedMilestones] = useState(0);

  useEffect(() => {
    if (displayedMilestones < milestonesHit) {
      const timer = setTimeout(() => {
        setDisplayedMilestones((prev) => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [displayedMilestones, milestonesHit]);

  const revenueProgress = Math.min(
    (currentMRR / REVENUE_TARGET) * 100,
    100
  );
  const usersProgress = Math.min((activeUsers / USERS_TARGET) * 100, 100);

  const milestones = [
    {
      name: "Revenue",
      current: `$${(currentMRR / 100).toFixed(0)}/mo`,
      target: `$${REVENUE_TARGET / 100}/mo`,
      progress: revenueProgress,
      completed: currentMRR >= REVENUE_TARGET,
    },
    {
      name: "Active Users",
      current: activeUsers.toString(),
      target: USERS_TARGET.toString(),
      progress: usersProgress,
      completed: activeUsers >= USERS_TARGET,
    },
    {
      name: "Feature Shipped",
      current: featureShipped ? "✓" : "—",
      target: "1 shipped",
      progress: featureShipped ? 100 : 0,
      completed: featureShipped,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Pro Milestones
        </h2>
        <p className="text-sm text-gray-600">
          You're building. Here's what you're hitting along the way.
        </p>
      </div>

      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6"
        >
          <div className="text-5xl font-bold text-gray-900">
            {displayedMilestones}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            of {milestonesHit < 2 ? "3" : milestonesHit >= 3 ? "3" : "3"}{" "}
            milestones hit
          </div>
        </motion.div>

        {milestonesHit >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md"
          >
            <p className="text-sm text-green-800">
              You've hit 2+ milestones. You're eligible to explore Max tier.
            </p>
          </motion.div>
        )}
      </div>

      <div className="space-y-6 mb-8">
        {milestones.map((milestone, idx) => (
          <motion.div
            key={milestone.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div
              className={`p-4 rounded-lg border ${
                milestone.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  {milestone.completed && "✓ "}
                  {milestone.name}
                </h3>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {milestone.current}
                  </div>
                  <div className="text-xs text-gray-500">
                    Target: {milestone.target}
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${milestone.progress}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1 + 0.2 }}
                  className={`h-2 rounded-full ${
                    milestone.completed ? "bg-green-600" : "bg-blue-600"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {maxUpgradeEligible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onMaxClickRedirect}
          className="w-full bg-black text-white py-3 px-4 rounded-md font-semibold hover:bg-gray-800 transition"
        >
          You're Eligible! Upgrade to Max
        </motion.button>
      )}

      {!maxUpgradeEligible && (
        <div className="text-center text-sm text-gray-500">
          Hit 2+ milestones to unlock Max tier
        </div>
      )}
    </div>
  );
};
