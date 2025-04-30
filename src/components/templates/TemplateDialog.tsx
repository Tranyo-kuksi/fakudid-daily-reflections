
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TemplateManager } from './TemplateManager';
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateDialog: React.FC<TemplateDialogProps> = ({ isOpen, onClose }) => {
  const { isSubscribed, openCheckout } = useSubscription();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {isSubscribed ? (
          <TemplateManager />
        ) : (
          <div className="py-8 text-center space-y-4">
            <SparklesIcon className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-2xl font-semibold">Premium Feature</h2>
            <p className="text-muted-foreground">
              Journal templates are available exclusively for premium users. Upgrade your account to access customizable templates and streamline your journaling process.
            </p>
            <Button 
              onClick={openCheckout}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              Upgrade to Premium
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
