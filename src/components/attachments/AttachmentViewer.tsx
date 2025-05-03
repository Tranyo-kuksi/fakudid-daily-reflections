
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon, Music, X, Maximize2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface Attachment {
  type: "image" | "music" | "spotify";
  url: string;
  name: string;
  data?: string; // Base64 data for persistent storage
  spotifyUri?: string; // Spotify URI for opening in Spotify
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

  const handlePlay = (audioSrc: string) => {
    try {
      const audio = new Audio(audioSrc);
      audio.play().catch(error => {
        console.error("Audio playback error:", error);
        toast.error("Couldn't play audio: " + error.message);
      });
    } catch (error) {
      console.error("Error setting up audio playback:", error);
      toast.error("Error playing audio");
    }
  };
  
  const openInSpotify = (spotifyUri: string | undefined) => {
    if (!spotifyUri) {
      toast.error("Spotify link not available");
      return;
    }
    
    // Open Spotify URI
    window.open(spotifyUri, '_blank');
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
            ) : attachment.type === 'spotify' ? (
              <div className="bg-muted p-2 rounded-md flex flex-col items-center gap-1 min-w-[100px]">
                <div className="flex items-center gap-1 text-sm mb-1">
                  <Music className={iconClass} />
                  <span className="truncate max-w-[150px]">{attachment.name}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs flex items-center gap-1"
                  onClick={() => openInSpotify(attachment.spotifyUri)}
                >
                  <ExternalLink className="h-3 w-3" />
                  Open in Spotify
                </Button>
              </div>
            ) : (
              <div className="bg-muted p-2 rounded-md flex flex-col items-center gap-1 min-w-[100px]">
                <div className="flex items-center gap-1 text-sm mb-1">
                  <Music className={iconClass} />
                  <span className="truncate max-w-[150px]">{attachment.name}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    if (attachment.data) {
                      handlePlay(attachment.data);
                    } else {
                      handlePlay(attachment.url);
                    }
                  }}
                >
                  Play Audio
                </Button>
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
