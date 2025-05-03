
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPOTIFY_CLIENT_ID = "c2c4255cd9124081b28c237a7b232b89";
const SPOTIFY_CLIENT_SECRET = "9de00f3d79534cf3b2c1e838a7e6395f";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Search query is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get Spotify access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token error:', tokenData);
      return new Response(
        JSON.stringify({ error: "Failed to authenticate with Spotify" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Search Spotify
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, 
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );
    
    const searchData = await searchResponse.json();
    
    if (!searchResponse.ok) {
      console.error('Search error:', searchData);
      return new Response(
        JSON.stringify({ error: "Failed to search Spotify" }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Format the response to include only what we need
    const tracks = searchData.tracks.items.map(track => {
      // Always include the external URL for fallback
      const externalUrl = track.external_urls?.spotify || "";
      
      // Verify preview URL is a valid URL or set to empty string
      let previewUrl = track.preview_url || "";
      
      // Log to help debugging
      console.log(`Track: ${track.name}, Preview URL: ${previewUrl || "No preview available"}, External URL: ${externalUrl}`);
      
      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(", "),
        album: track.album.name,
        albumArt: track.album.images[0]?.url || "",
        previewUrl: previewUrl, // Ensure this is a string, even if empty
        externalUrl: externalUrl,
      };
    });
    
    return new Response(
      JSON.stringify({ tracks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
