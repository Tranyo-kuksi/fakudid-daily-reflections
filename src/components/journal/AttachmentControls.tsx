
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageIcon, Music, Mic, Search, ExternalLink } from "lucide-react";
import { SpotifySearch } from "@/components/attachments/SpotifySearch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  externalUrl: string;
}

interface AttachmentControlsProps {
  onImageClick: () => void;
  onMusicClick: (file?: File) => void;
  onSpotifyTrackSelect: (track: SpotifyTrack) => void;
  onVoiceRecordingSelect: (blob: Blob, fileName: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  audioInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "music") => void;
  readOnly?: boolean;
}

export const AttachmentControls: React.FC<AttachmentControlsProps> = ({
  onImageClick,
  onMusicClick,
  onSpotifyTrackSelect,
  fileInputRef,
  audioInputRef,
  onFileSelected,
  readOnly = false
}) => {
  const [isSpotifySearchOpen, setIsSpotifySearchOpen] = useState(false);
  
  const handleVoiceRecordClick = () => {
    toast.info("Please use your device's voice recorder app and upload the file when finished");
  };
  
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={readOnly}
                >
                  <Music className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onMusicClick()}>
                  <Music className="h-4 w-4 mr-2" />
                  Upload Music File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSpotifySearchOpen(true)}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Spotify
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleVoiceRecordClick}>
                  <Mic className="h-4 w-4 mr-2" />
                  Record Voice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Audio</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <SpotifySearch 
        isOpen={isSpotifySearchOpen} 
        onClose={() => setIsSpotifySearchOpen(false)}
        onSelect={onSpotifyTrackSelect}
      />
    </div>
  );
};
