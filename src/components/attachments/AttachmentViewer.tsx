
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon, Music, X, Maximize2, Trash2, Play, Pause, ExternalLink, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface Attachment {
  type: "image" | "music" | "spotify" | "voice";
  url: string;
  name: string;
  data?: string; // Base64 data for persistent storage
  metadata?: {
    artist?: string;
    album?: string;
    albumArt?: string;
    previewUrl?: string;
    externalUrl?: string;
    spotifyId?: string;
  };
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
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

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
    if (attachment.data && (attachment.type === 'image' || attachment.type === 'voice')) {
      return attachment.data;
    }
    // For Spotify, use album art if available
    if (attachment.type === 'spotify' && attachment.metadata?.albumArt) {
      return attachment.metadata.albumArt;
    }
    // Fall back to URL (temporary)
    return attachment.url;
  };
  
  // Play audio for non-Spotify tracks
  const playAudio = (attachment: Attachment, index: number) => {
    // Don't attempt to play Spotify tracks
    if (attachment.type === 'spotify') {
      return;
    }
    
    // Stop currently playing audio if any
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
      setPlayingAudioIndex(null);
    }
    
    // If clicking the same audio that's playing, just stop it
    if (playingAudioIndex === index) {
      return;
    }
    
    // Determine the source to play based on type and availability
    let audioSource = "";
    
    if (attachment.data && attachment.type === 'voice') {
      audioSource = attachment.data;
    } else if (attachment.url) {
      audioSource = attachment.url;
    }
    
    if (!audioSource) {
      toast.error("No audio source available");
      return;
    }
    
    // Create and play audio
    console.log('Playing audio source:', audioSource);
    const audio = new Audio(audioSource);
    
    // Add robust error handling
    audio.addEventListener('error', (e) => {
      console.error('Error loading audio:', e, audio.error);
      
      // Handle specific error types
      let errorMessage = "Failed to play audio";
      
      // Check if it's a media error
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Playback aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error while loading audio";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Audio decode error";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Audio format not supported";
            break;
        }
      }
      
      toast.error(errorMessage);
      setPlayingAudioIndex(null);
      setAudioElement(null);
    });
    
    audio.addEventListener('ended', () => {
      setPlayingAudioIndex(null);
      setAudioElement(null);
    });
    
    // Try to play with better error handling
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      toast.error(`Couldn't play audio: ${error.message}`);
      setPlayingAudioIndex(null);
      setAudioElement(null);
    });
    
    setPlayingAudioIndex(index);
    setAudioElement(audio);
  };

  // Open Spotify link
  const openSpotifyLink = (attachment: Attachment) => {
    if (attachment.type === 'spotify' && attachment.metadata?.externalUrl) {
      window.open(attachment.metadata.externalUrl, '_blank');
    } else {
      toast.error("No Spotify link available");
    }
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
            ) : (attachment.type === 'spotify' ? (
              <div className="bg-muted p-2 rounded-md flex items-center gap-2 pr-4" style={{ minWidth: '200px' }}>
                {attachment.metadata?.albumArt ? (
                  <img 
                    src={attachment.metadata.albumArt} 
                    alt={attachment.name} 
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-black/10 rounded flex items-center justify-center">
                    <Music className={iconClass} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{attachment.name}</p>
                  {attachment.metadata?.artist && (
                    <p className="text-xs text-muted-foreground truncate">{attachment.metadata.artist}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto" 
                  onClick={(e) => {
                    e.stopPropagation();
                    openSpotifyLink(attachment);
                  }}
                  title="Open in Spotify"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ) : attachment.type === 'voice' ? (
              <div className="bg-muted p-2 rounded-md flex items-center gap-2">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mic className={iconClass} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Voice recording</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(attachment, i);
                  }}
                >
                  {playingAudioIndex === i ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-muted p-2 rounded-md text-sm flex items-center gap-1">
                <Music className={iconClass} />
                <span className="truncate max-w-[120px]">{attachment.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(attachment, i);
                  }}
                >
                  {playingAudioIndex === i ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
            
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
