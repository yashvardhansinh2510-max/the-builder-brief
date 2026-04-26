import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export function usePayments() {
  const { session } = useAuth();

  const initiatePayment = async (plan: string) => {
    try {
      const tid = toast.loading(`Initiating ${plan.toUpperCase()} upgrade...`);

      // 1. Create Order on Backend
      const res = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ plan })
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Failed to create order");

      // 2. Configure Razorpay Options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "The Builder Brief",
        description: `${plan.toUpperCase()} Membership Upgrade`,
        image: "/favicon.svg",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyTid = toast.loading("Verifying transaction...");
          
          // 3. Verify Payment on Backend
          const verifyRes = await fetch("/api/payments/verify-razorpay", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            })
          });

          if (verifyRes.ok) {
            toast.success("Upgrade Successful!", {
              id: verifyTid,
              description: `Welcome to the ${plan.toUpperCase()} Tier. Your access is now live.`
            });
            // Refresh page to update tier state
            setTimeout(() => window.location.reload(), 2000);
          } else {
            toast.error("Verification failed. Please contact support.", { id: verifyTid });
          }
        },
        prefill: {
          email: session?.user?.email,
        },
        theme: {
          color: "#F97316"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed", { description: response.error.description });
      });
      
      toast.dismiss(tid);
      rzp.open();
    } catch (error: any) {
      toast.error("Billing Error", { description: error.message });
    }
  };

  return { initiatePayment };
}
