
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

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
  const { user, session } = useAuth();

  const checkSubscription = async () => {
    if (!user || !session) {
      setIsSubscribed(false);
      setSubscriptionEnd(null);
      return;
    }

    try {
      setIsCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        toast.error('Failed to check subscription status');
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
      
      console.log('Creating checkout session...');
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      toast.dismiss(loadingToast);
      
      if (error) {
        console.error('Error creating checkout:', error);
        toast.error('Failed to create checkout session: ' + error.message);
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

    if (!isSubscribed) {
      toast.error('You don\'t have an active subscription to manage');
      return;
    }

    try {
      const loadingToast = toast.loading('Preparing customer portal...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      toast.dismiss(loadingToast);
      
      if (error) {
        console.error('Error opening customer portal:', error);
        toast.error('Failed to open customer portal: ' + error.message);
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
    </SubscriptionContext.Provider>
  );
};
