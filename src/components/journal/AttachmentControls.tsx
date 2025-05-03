
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
    }, 300);
  }, []);
  
  const handleSpotifyTrackSelected = useCallback((track: any) => {
    if (onSpotifySelected) {
      // Set processing flag to prevent multiple actions
      setIsProcessing(true);
      
      // First close the search dialog
      setShowSpotifySearch(false);
      
      // Then handle the selected track after a small delay
      setTimeout(() => {
        onSpotifySelected(track);
        // Reset processing state after handling the track
        setIsProcessing(false);
      }, 100);
    }
  }, [onSpotifySelected]);

  // Clean up state when component unmounts
  useEffect(() => {
    return () => {
      setShowSpotifySearch(false);
      setIsProcessing(false);
    };
  }, []);

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
              size="icon" 
              onClick={onImageClick}
              disabled={readOnly || isProcessing}
            >
              <ImageIcon className="h-5 w-5" />
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
                  size="icon"
                  disabled={readOnly || isProcessing}
                >
                  <Music className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Audio</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="center" className="w-48">
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
