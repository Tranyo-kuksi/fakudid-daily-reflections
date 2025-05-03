
import { useState } from "react";
import { Search, X, Music, Play, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  externalUrl: string;
}

interface SpotifySearchProps {
  onSelect: (track: SpotifyTrack) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SpotifySearch = ({ onSelect, isOpen, onClose }: SpotifySearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('spotify-search', {
        body: { query: query.trim() }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResults(data.tracks || []);
      
      if (data.tracks.length === 0) {
        toast.info("No songs found. Try a different search term.");
      }
    } catch (error) {
      console.error("Spotify search error:", error);
      toast.error("Failed to search Spotify. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectTrack = (track: SpotifyTrack) => {
    // Stop any playing preview before selecting
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
      setPlayingTrackId(null);
    }

    onSelect(track);
    onClose();
    toast.success(`"${track.name}" by ${track.artist} added`);
  };
  
  // Handle track preview playback
  const togglePreview = (track: SpotifyTrack) => {
    // If there's already audio playing, stop it
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewAudio(null);
      setPlayingTrackId(null);
      
      // If we clicked the same track that was playing, just stop it
      if (playingTrackId === track.id) {
        return;
      }
    }
    
    // No preview URL available
    if (!track.previewUrl) {
      toast.info("No preview available for this track");
      return;
    }
    
    // Create and play new audio
    const audio = new Audio(track.previewUrl);
    audio.addEventListener('ended', () => {
      setPlayingTrackId(null);
      setPreviewAudio(null);
    });
    
    audio.play().catch(error => {
      console.error('Error playing preview:', error);
      toast.error("Couldn't play preview");
    });
    
    setPlayingTrackId(track.id);
    setPreviewAudio(audio);
  };
  
  // Clean up audio when dialog closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
        setPlayingTrackId(null);
      }
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Spotify</DialogTitle>
          <DialogDescription>
            Find songs to attach to your journal entry
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="flex gap-2 mt-2">
          <Input 
            placeholder="Search for songs..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="max-h-[50vh] overflow-y-auto mt-4">
          {results.map(track => (
            <div 
              key={track.id} 
              className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer mb-2"
              onClick={() => handleSelectTrack(track)}
            >
              {track.albumArt ? (
                <img src={track.albumArt} alt={track.album} className="w-10 h-10 rounded" />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  <Music className="h-5 w-5" />
                </div>
              )}
              
              <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">{track.name}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
              
              {track.previewUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview(track);
                  }}
                >
                  {playingTrackId === track.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">No preview</span>
              )}
            </div>
          ))}
          
          {results.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Search for songs to see results
            </div>
          )}
          
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Searching...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
