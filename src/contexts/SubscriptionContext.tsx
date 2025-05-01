
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
  isCheckingSubscription: boolean;
  openCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  subscriptionEnd: null,
  checkSubscription: async () => {},
  isCheckingSubscription: false,
  openCheckout: async () => {},
  openCustomerPortal: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const { user, session } = useAuth();

  // Helper to ensure we have a valid session
  const ensureValidSession = async () => {
    if (!session) {
      // Get the latest session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return false;
      }
      return true;
    }
    return true;
  };

  const checkSubscription = async () => {
    if (!user || !session) {
      setIsSubscribed(false);
      setSubscriptionEnd(null);
      return;
    }

    try {
      setIsCheckingSubscription(true);
      
      const hasValidSession = await ensureValidSession();
      if (!hasValidSession) {
        console.error('No valid session for checking subscription');
        toast.error('Authentication error: Please sign in again');
        setIsCheckingSubscription(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        toast.error('Failed to check subscription status');
        setIsCheckingSubscription(false);
        return;
      }
      
      // If we got a specific error from the edge function
      if (data.error) {
        console.error('Subscription check error:', data.error, data.details);
        toast.error(`Subscription check failed: ${data.details || data.error}`);
        setIsCheckingSubscription(false);
        return;
      }
      
      setIsSubscribed(data.subscribed);
      setSubscriptionEnd(data.subscription_end);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to check subscription status');
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const openCheckout = async () => {
    if (!user || !session) {
      toast.error('You must be logged in to subscribe');
      return;
    }

    try {
      const loadingToast = toast.loading('Preparing checkout...');
      
      const hasValidSession = await ensureValidSession();
      if (!hasValidSession) {
        toast.dismiss(loadingToast);
        toast.error('Authentication error: Please sign in again');
        return;
      }
      
      // Get a fresh token to ensure we're authenticated
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please sign in again.');
        return;
      }
      
      console.log('Creating checkout session...');
      
      // Pass the session in the request body as a fallback
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { session: currentSession },
      });
      
      toast.dismiss(loadingToast);
      
      if (error) {
        console.error('Error creating checkout:', error);
        toast.error('Failed to create checkout session: ' + error.message);
        return;
      }
      
      // If we got a specific error from the edge function
      if (data.error) {
        console.error('Checkout error:', data.error, data.details);
        toast.error(`Checkout failed: ${data.details || data.error}`);
        return;
      }
      
      if (!data || !data.url) {
        console.error('Invalid response from create-checkout:', data);
        toast.error('Failed to create checkout URL. Try again later.');
        return;
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening checkout:', error);
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to start checkout process: ' + errorMessage);
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      toast.error('You must be logged in to manage your subscription');
      return;
    }

    try {
      const loadingToast = toast.loading('Preparing customer portal...');
      
      const hasValidSession = await ensureValidSession();
      if (!hasValidSession) {
        toast.dismiss(loadingToast);
        toast.error('Authentication error: Please sign in again');
        return;
      }
      
      // Get a fresh token to ensure we're authenticated
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please sign in again.');
        return;
      }
      
      console.log('Creating customer portal session with token:', currentSession.access_token.substring(0, 10) + '...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });
      
      toast.dismiss(loadingToast);
      
      if (error) {
        console.error('Error opening customer portal:', error);
        toast.error('Failed to open customer portal: ' + error.message);
        return;
      }
      
      // If we got a specific error from the edge function
      if (data && data.error) {
        console.error('Customer portal error:', data.error, data.details);
        
        // If the user doesn't have a subscription yet
        if (data.error === 'No Stripe customer found') {
          toast.error('You need to subscribe first before managing your subscription', {
            action: {
              label: 'Subscribe',
              onClick: () => openCheckout()
            }
          });
          return;
        }
        
        // Special case for portal configuration error
        if (data.configuration_required) {
          console.log('Stripe Portal needs configuration');
          setShowConfigDialog(true);
          return;
        }
        
        toast.error(`Customer portal failed: ${data.details || data.error}`);
        return;
      }
      
      // Redirect to Stripe Customer Portal
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create customer portal URL');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to open customer portal: ' + errorMessage);
    }
  };

  useEffect(() => {
    // Check subscription status when user changes
    if (user) {
      checkSubscription();
    } else {
      setIsSubscribed(false);
      setSubscriptionEnd(null);
    }
  }, [user]);

  useEffect(() => {
    // Check subscription after redirect from Stripe
    const query = new URLSearchParams(window.location.search);
    const checkoutStatus = query.get('checkout');
    
    if (checkoutStatus === 'success') {
      toast.success('Thank you for your subscription!');
      checkSubscription();
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
    } else if (checkoutStatus === 'canceled') {
      toast.info('Checkout was canceled');
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    <SubscriptionContext.Provider 
      value={{ 
        isSubscribed, 
        subscriptionEnd, 
        checkSubscription, 
        isCheckingSubscription,
        openCheckout,
        openCustomerPortal
      }}
    >
      {children}
      
      {/* Portal Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stripe Customer Portal Setup Required</DialogTitle>
            <DialogDescription>
              The Stripe Customer Portal has not been configured in your Stripe Dashboard. You need to configure it before users can manage their subscriptions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Please follow these steps:
            </p>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>Go to the Stripe Dashboard</li>
              <li>Navigate to Settings → Billing → Customer Portal</li>
              <li>Configure the basic settings for your Customer Portal</li>
              <li>Save your changes</li>
              <li>Return to this app to manage subscriptions</li>
            </ol>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowConfigDialog(false)}>
              Close
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                window.open('https://dashboard.stripe.com/test/settings/billing/portal', '_blank');
                setShowConfigDialog(false);
              }}
            >
              Open Stripe Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SubscriptionContext.Provider>
  );
};
