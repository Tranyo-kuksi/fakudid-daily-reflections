
import React, { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageIcon, Music } from "lucide-react";
import { SpotifySearch } from "@/components/spotify/SpotifySearch";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface AttachmentControlsProps {
  onImageClick: () => void;
  onMusicClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  audioInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "music") => void;
  onSpotifySelected?: (track: any) => void;
  readOnly?: boolean;
}

export const AttachmentControls: React.FC<AttachmentControlsProps> = ({
  onImageClick,
  onMusicClick,
  fileInputRef,
  audioInputRef,
  onFileSelected,
  onSpotifySelected,
  readOnly = false
}) => {
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useIsMobile();

  // Clean up processing state automatically after timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isProcessing) {
      timeoutId = setTimeout(() => {
        setIsProcessing(false);
      }, 1500); // Extended timeout for mobile devices
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isProcessing]);

  // Reset all states when component unmounts
  useEffect(() => {
    return () => {
      setShowSpotifySearch(false);
      setIsProcessing(false);
    };
  }, []);
  
  // Function to safely handle opening and closing the Spotify search
  const handleOpenSpotifySearch = useCallback(() => {
    if (!isProcessing) {
      setShowSpotifySearch(true);
    }
  }, [isProcessing]);
  
  const handleCloseSpotifySearch = useCallback(() => {
    setShowSpotifySearch(false);
    // Add a slight delay before allowing another dialog to be opened
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 800); // Extended for mobile response time
  }, []);
  
  const handleSpotifyTrackSelected = useCallback((track: any) => {
    if (!onSpotifySelected) return;
    
    try {
      // Set processing flag to prevent multiple actions
      setIsProcessing(true);
      
      // Close the search dialog
      setShowSpotifySearch(false);
      
      // Add longer delay before calling the callback to ensure dialog is fully closed
      setTimeout(() => {
        if (onSpotifySelected) {
          try {
            onSpotifySelected(track);
          } catch (err) {
            console.error("Error selecting Spotify track:", err);
            toast.error("Failed to add track to journal");
          }
        }
        // Reset processing state after handling the track
        setIsProcessing(false);
      }, 800); // Extended for mobile
    } catch (error) {
      console.error("Error handling Spotify track selection:", error);
      setShowSpotifySearch(false);
      setIsProcessing(false);
      toast.error("Failed to process selected track");
    }
  }, [onSpotifySelected]);

  // Adjust button size for better touch targets on mobile
  const buttonSize = isMobile ? "sm" : "icon";
  const buttonClass = isMobile ? "px-3 py-2" : "";

  return (
    <div className="flex gap-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => onFileSelected(e, "image")} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={audioInputRef} 
        onChange={(e) => onFileSelected(e, "music")} 
        accept="audio/*" 
        className="hidden" 
      />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size={buttonSize}
              className={buttonClass}
              onClick={onImageClick}
              disabled={readOnly || isProcessing}
            >
              <ImageIcon className={isMobile ? "h-6 w-6 mr-2" : "h-5 w-5"} />
              {isMobile && "Image"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size={buttonSize}
                  className={buttonClass}
                  disabled={readOnly || isProcessing}
                >
                  <Music className={isMobile ? "h-6 w-6 mr-2" : "h-5 w-5"} />
                  {isMobile && "Audio"}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Audio</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="center" className={isMobile ? "w-56" : "w-48"}>
          <DropdownMenuItem 
            onClick={onMusicClick} 
            className="cursor-pointer"
            disabled={isProcessing}
          >
            <Music className="mr-2 h-4 w-4" />
            <span>Upload Audio File</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleOpenSpotifySearch} 
            className="cursor-pointer"
            disabled={isProcessing}
          >
            <Music className="mr-2 h-4 w-4" />
            <span>Search Spotify</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showSpotifySearch && onSpotifySelected && (
        <SpotifySearch 
          isOpen={showSpotifySearch}
          onClose={handleCloseSpotifySearch}
          onTrackSelect={handleSpotifyTrackSelected}
        />
      )}
    </div>
  );
};
