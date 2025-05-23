
import React, { useState, useEffect, useCallback } from "react";
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
  const [localOpen, setLocalOpen] = useState(false);

  // Synchronize the local state with the prop
  useEffect(() => {
    if (isOpen) {
      setLocalOpen(true);
    }
  }, [isOpen]);

  // Reset state when dialog closes completely
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // First update the local state
      setLocalOpen(false);
      
      // Clear the search and results with a small delay to ensure animations complete
      setTimeout(() => {
        setSearchResults([]);
        setSearchQuery("");
        setIsLoading(false);
        
        // Then notify the parent component
        onClose();
      }, 100);
    }
  }, [onClose]);

  // Handle ESC key and cleanup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && localOpen) {
        e.preventDefault();
        handleOpenChange(false);
      }
    };

    if (localOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [localOpen, handleOpenChange]);

  // Clean up function to ensure everything is reset when component unmounts
  useEffect(() => {
    return () => {
      setSearchResults([]);
      setSearchQuery("");
      setIsLoading(false);
      setLocalOpen(false);
    };
  }, []);

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
        if (data.tracks.length === 0) {
          toast.info("No results found");
        }
      } else {
        setSearchResults([]);
        toast.info("No results found");
      }
    } catch (error) {
      console.error("Spotify search error:", error);
      toast.error("Failed to search Spotify");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTrackSelect = useCallback((track: SpotifyTrack) => {
    try {
      // Make a copy of the track to prevent any potential reference issues
      const trackCopy = { ...track };
      
      // First close the dialog
      setLocalOpen(false);
      
      // Then call the callback after a delay to ensure dialog is fully closed
      setTimeout(() => {
        onTrackSelect(trackCopy);
      }, 300);
    } catch (error) {
      console.error("Error selecting track:", error);
      toast.error("Failed to select track");
      // Make sure dialog closes even on error
      setLocalOpen(false);
      setTimeout(() => onClose(), 100);
    }
  }, [onClose, onTrackSelect]);
  
  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={handleOpenChange}
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
