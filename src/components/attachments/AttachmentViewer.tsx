
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon, Music, X, Maximize2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  type: "image" | "music";
  url: string;
  name: string;
  data?: string; // Base64 data for persistent storage
}

interface AttachmentViewerProps {
  attachments?: Attachment[];
  size?: "small" | "medium" | "large";
  showFullScreenOption?: boolean;
  onDelete?: (index: number) => void;
}

export const AttachmentViewer = ({ 
  attachments = [], 
  size = "medium", 
  showFullScreenOption = true,
  onDelete
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
  
  // Function to get the correct image source (base64 data or URL)
  const getImageSource = (attachment: Attachment): string => {
    // Use base64 data if available (for persistence)
    if (attachment.data && attachment.type === 'image') {
      return attachment.data;
    }
    // Fall back to URL (temporary)
    return attachment.url;
  };
  
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, i) => (
          <div key={i} className="relative group">
            {attachment.type === 'image' ? (
              <div 
                className={`${
                  showFullScreenOption ? 'cursor-pointer hover:opacity-90' : ''
                } relative rounded-md overflow-hidden`}
                onClick={() => {
                  if (showFullScreenOption) {
                    setSelectedImage(getImageSource(attachment));
                  }
                }}
              >
                <img 
                  src={getImageSource(attachment)} 
                  alt={attachment.name}
                  className="h-20 w-20 object-cover rounded-md"
                />
                {showFullScreenOption && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted p-2 rounded-md text-sm flex items-center gap-1">
                <Music className={iconClass} />
                <span>{attachment.name}</span>
              </div>
            )}
            
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
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
