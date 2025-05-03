
import { useState } from "react";
import { Search, X, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    onSelect(track);
    onClose();
    toast.success(`"${track.name}" by ${track.artist} added`);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Spotify</DialogTitle>
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
                <audio src={track.previewUrl} controls className="h-8 w-28" />
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
