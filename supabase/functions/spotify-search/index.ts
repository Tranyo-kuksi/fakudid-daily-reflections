
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLIENT_ID = "c2c4255cd9124081b28c237a7b232b89";
const CLIENT_SECRET = "9de00f3d79534cf3b2c1e838a7e6395f";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body with error handling
    let query = "";
    try {
      const body = await req.json();
      query = body.query || "";
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!query.trim()) {
      return new Response(
        JSON.stringify({ error: 'No query provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Step 1: Get access token
    console.log("Fetching Spotify access token");
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get token from Spotify:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Spotify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get Spotify access token:', tokenData);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Spotify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Step 2: Search Spotify
    console.log(`Searching Spotify for: ${query}`);
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Spotify search API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Error searching Spotify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const searchData = await searchResponse.json();
    
    if (searchData.error) {
      console.error('Spotify search error:', searchData.error);
      return new Response(
        JSON.stringify({ error: 'Error searching Spotify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check if tracks exist in the response
    if (!searchData.tracks || !Array.isArray(searchData.tracks.items)) {
      console.error('Unexpected Spotify API response format:', searchData);
      return new Response(
        JSON.stringify({ tracks: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Format results with album cover images
    const tracks = searchData.tracks.items.map(track => {
      let albumImageUrl = null;
      
      // Extract album cover image
      if (track.album && track.album.images && track.album.images.length > 0) {
        // Use the medium size image if available
        const mediumImage = track.album.images.find(image => image.height === 300);
        // Otherwise use the first image
        albumImageUrl = mediumImage ? mediumImage.url : track.album.images[0].url;
      }
      
      return {
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        uri: track.uri,
        albumImageUrl
      };
    });

    console.log(`Found ${tracks.length} tracks`);
    return new Response(
      JSON.stringify({ tracks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in Spotify search function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
