
import React from "react";
import { AttachmentViewer } from "@/components/attachments/AttachmentViewer";

interface AttachmentSectionProps {
  attachments?: any[];
  onDelete?: (index: number) => void;
  readOnly: boolean;
  editMode: boolean;
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  attachments,
  onDelete,
  readOnly,
  editMode,
}) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="bg-background p-4 rounded-md border">
      <AttachmentViewer 
        attachments={attachments} 
        size="medium"
        onDelete={(readOnly && !editMode) ? undefined : onDelete}
      />
    </div>
  );
};
