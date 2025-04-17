
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon, Music, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  type: "image" | "music";
  url: string;
  name: string;
}

interface AttachmentViewerProps {
  attachments?: Attachment[];
  size?: "small" | "medium" | "large";
  showFullScreenOption?: boolean;
}

export const AttachmentViewer = ({ 
  attachments = [], 
  size = "medium", 
  showFullScreenOption = true 
}: AttachmentViewerProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const sizeClasses = {
    small: "h-3 w-3",
    medium: "h-4 w-4",
    large: "h-5 w-5"
  };

  const iconClass = sizeClasses[size];
  
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, i) => (
          <div 
            key={i} 
            className={`bg-muted p-2 rounded-md text-sm flex items-center gap-1 ${
              attachment.type === 'image' && showFullScreenOption ? 'cursor-pointer hover:bg-muted/80' : ''
            }`}
            onClick={() => {
              if (attachment.type === 'image' && showFullScreenOption) {
                setSelectedImage(attachment.url);
              }
            }}
          >
            {attachment.type === 'image' ? (
              <>
                <ImageIcon className={iconClass} />
                <span>{attachment.name}</span>
                {showFullScreenOption && <Maximize2 className="h-3 w-3 ml-1 text-muted-foreground" />}
              </>
            ) : (
              <>
                <Music className={iconClass} />
                <span>{attachment.name}</span>
              </>
            )}
          </div>
        ))}
      </div>
      
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-1">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2 z-10 bg-background/80 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={selectedImage || ''} 
              alt="Full size attachment" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
