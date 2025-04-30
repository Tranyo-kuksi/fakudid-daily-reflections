
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TemplateManager } from './TemplateManager';
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { TemplateState } from './TemplateManager';

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: TemplateState;
  readOnly?: boolean;
  onEdit?: () => void;
  entryId?: string;
}

export const TemplateDialog: React.FC<TemplateDialogProps> = ({ 
  isOpen, 
  onClose, 
  initialValues,
  readOnly = false,
  onEdit,
  entryId
}) => {
  const { isSubscribed, openCheckout } = useSubscription();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {isSubscribed ? (
          <div className="space-y-4">
            {readOnly && onEdit && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md flex justify-between items-center">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  You are viewing a past entry's template data in read-only mode.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="ml-2 border-yellow-500 text-yellow-700 dark:text-yellow-300"
                >
                  Edit Entry
                </Button>
              </div>
            )}
            <TemplateManager 
              initialValues={initialValues} 
              readOnly={readOnly} 
              onEdit={onEdit}
              entryId={entryId}
            />
          </div>
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
