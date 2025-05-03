
import React from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageIcon, Music, Search } from "lucide-react";
import { SpotifySearch } from "@/components/spotify/SpotifySearch";

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
  const [showSpotifySearch, setShowSpotifySearch] = React.useState(false);

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
              disabled={readOnly}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onMusicClick}
              disabled={readOnly}
            >
              <Music className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Voice Recording</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowSpotifySearch(true)}
              disabled={readOnly}
            >
              <Search className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search Spotify</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showSpotifySearch && onSpotifySelected && (
        <SpotifySearch 
          isOpen={showSpotifySearch}
          onClose={() => setShowSpotifySearch(false)}
          onTrackSelect={onSpotifySelected}
        />
      )}
    </div>
  );
};
