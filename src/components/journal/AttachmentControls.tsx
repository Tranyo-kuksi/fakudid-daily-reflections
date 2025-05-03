
import React from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageIcon, Music, FileAudio } from "lucide-react";
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
      
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={readOnly}
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
          <DropdownMenuItem onClick={onMusicClick} className="cursor-pointer">
            <FileAudio className="mr-2 h-4 w-4" />
            <span>Upload Audio File</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowSpotifySearch(true)} 
            className="cursor-pointer"
          >
            <Music className="mr-2 h-4 w-4" />
            <span>Search Spotify</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
