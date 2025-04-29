
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TemplateManager } from './TemplateManager';

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateDialog: React.FC<TemplateDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <TemplateManager />
      </DialogContent>
    </Dialog>
  );
};
