import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { isSubscribed, subscriptionEnd, openCheckout, openCustomerPortal } = useSubscription();

  return (
    <div className="container mx-auto px-4 py-8 max-w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Account</h2>
        <Button variant="destructive" onClick={signOut}>Sign Out</Button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Subscription</h2>
        {isSubscribed ? (
          <>
            <p className="mb-2">
              Your subscription is active and will end on {new Date(subscriptionEnd!).toLocaleDateString()}.
            </p>
            <Button onClick={openCustomerPortal}>Manage Subscription</Button>
          </>
        ) : (
          <>
            <p className="mb-2">You are not currently subscribed to the premium plan.</p>
            <Button onClick={openCheckout}>Subscribe Now</Button>
          </>
        )}
      </div>
    </div>
  );
}
