
import { useState } from "react";
import { Search, X, Music, ExternalLink } from "lucide-react";
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
  previewUrl: string;
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
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  
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
      
      // Ensure all tracks have valid values for critical fields
      const processedTracks = (data.tracks || []).map((track: SpotifyTrack) => ({
        ...track,
        previewUrl: track.previewUrl || "",
        externalUrl: track.externalUrl || ""
      }));
      
      setResults(processedTracks);
      
      if (processedTracks.length === 0) {
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
    // Prevent multiple rapid selections that could cause UI freeze
    if (selectedTrackIndex !== null) return;
    
    // Set selection state to prevent multiple clicks
    setSelectedTrackIndex(results.findIndex(t => t.id === track.id));

    // Use a timeout to allow UI to update before processing
    setTimeout(() => {
      onSelect(track);
      onClose();
      toast.success(`"${track.name}" by ${track.artist} added`);
      
      // Reset selection state after a delay
      setTimeout(() => {
        setSelectedTrackIndex(null);
      }, 300);
    }, 10);
  };
  
  const openSpotify = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error("No Spotify link available for this track");
    }
  };
  
  // Clean up when dialog closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedTrackIndex(null);
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
          {results.map((track, index) => (
            <div 
              key={track.id} 
              className={`flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer mb-2 ${selectedTrackIndex === index ? 'bg-muted' : ''}`}
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
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => openSpotify(e, track.externalUrl)}
                title="Open in Spotify"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
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
