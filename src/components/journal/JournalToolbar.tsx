
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Sparkles } from "lucide-react";
import { AttachmentControls } from "@/components/journal/AttachmentControls";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface JournalToolbarProps {
  onTemplateOpen: () => void;
  onImageClick: () => void;
  onMusicClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  audioInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "music") => void;
  readOnly: boolean;
  editMode: boolean;
  templateData?: { sections: Record<string, string[]> };
  viewTemplateData: () => void;
}

export const JournalToolbar: React.FC<JournalToolbarProps> = ({
  onTemplateOpen,
  onImageClick,
  onMusicClick,
  fileInputRef,
  audioInputRef,
  onFileSelected,
  readOnly,
  editMode,
  templateData,
  viewTemplateData
}) => {
  const { isSubscribed, openCheckout } = useSubscription();

  return (
    <div className="flex justify-between items-center">
      <AttachmentControls
        onImageClick={onImageClick}
        onMusicClick={onMusicClick}
        fileInputRef={fileInputRef}
        audioInputRef={audioInputRef}
        onFileSelected={onFileSelected}
        readOnly={readOnly && !editMode}
      />

      {readOnly && !editMode ? (
        (isSubscribed && templateData && Object.keys(templateData.sections).length > 0) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={viewTemplateData}
            className="flex items-center gap-2"
          >
            <LayoutGrid size={16} />
            View Template Data
          </Button>
        )
      ) : (
        isSubscribed ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTemplateOpen}
            className="flex items-center gap-2"
          >
            <LayoutGrid size={16} />
            Template
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openCheckout}
            className="flex items-center gap-2"
          >
            <Sparkles size={16} className="text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">Premium Templates</span>
          </Button>
        )
      )}
    </div>
  );
};
