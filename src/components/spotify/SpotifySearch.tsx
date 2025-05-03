
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Music, Search, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  uri: string;
  album: string;
  albumImageUrl?: string;
}

interface SpotifySearchProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackSelect: (track: SpotifyTrack) => void;
}

export const SpotifySearch: React.FC<SpotifySearchProps> = ({ isOpen, onClose, onTrackSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Clean up on unmount or dialog close
  React.useEffect(() => {
    return () => {
      // Clear any state on unmount to prevent memory leaks
      setSearchResults([]);
      setSearchQuery("");
    };
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("spotify-search", {
        body: { query: searchQuery }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.tracks) {
        setSearchResults(data.tracks);
      } else {
        setSearchResults([]);
        toast.info("No results found");
      }
    } catch (error) {
      console.error("Spotify search error:", error);
      toast.error("Failed to search Spotify");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTrackSelect = (track: SpotifyTrack) => {
    // Make a copy of the track to prevent any potential reference issues
    const trackCopy = { ...track };
    onTrackSelect(trackCopy);
    onClose();
  };

  // Safe dialog close handler
  const handleDialogClose = () => {
    // Clear search results before closing to prevent state issues
    setSearchResults([]);
    setSearchQuery("");
    onClose();
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleDialogClose();
      }}
    >
      <DialogContent 
        className="sm:max-w-md"
        aria-describedby="spotify-search-description"
      >
        <DialogHeader>
          <DialogTitle>Search Spotify</DialogTitle>
          <DialogDescription id="spotify-search-description">
            Search for songs on Spotify and add them to your journal.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
          <Input 
            placeholder="Search songs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : <Search className="h-4 w-4" />}
          </Button>
        </form>
        
        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((track) => (
                <div 
                  key={track.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                  onClick={() => handleTrackSelect(track)}
                >
                  <div className="flex items-center gap-3">
                    {track.albumImageUrl ? (
                      <img 
                        src={track.albumImageUrl} 
                        alt={`${track.album} cover`} 
                        className="h-12 w-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <Music className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artists}</p>
                    </div>
                  </div>
                  
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-50" />
                </div>
              ))}
            </div>
          ) : (
            searchQuery && !isLoading && (
              <p className="text-center text-muted-foreground py-4">No results found</p>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
