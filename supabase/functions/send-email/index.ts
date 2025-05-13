
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  from_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request data
    const { to, subject, body, from_name } = await req.json() as EmailRequest;
    
    // Validate required fields
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Kit API credentials
    const KIT_API_KEY = Deno.env.get("KIT_API_KEY");
    const KIT_API_SECRET = Deno.env.get("KIT_API_SECRET");
    const APP_EMAIL = Deno.env.get("APP_EMAIL_ADDRESS");
    
    // Log environment variable status (without revealing actual values)
    console.log("Environment check:");
    console.log("- KIT_API_KEY present:", KIT_API_KEY ? "Yes" : "No");
    console.log("- KIT_API_SECRET present:", KIT_API_SECRET ? "Yes" : "No");
    console.log("- APP_EMAIL_ADDRESS present:", APP_EMAIL ? "Yes" : "No");
    
    if (!KIT_API_KEY || !KIT_API_SECRET) {
      console.error("Missing Kit API credentials");
      return new Response(
        JSON.stringify({ error: "Email sending is not configured properly" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Format email for Kit API
    const emailContent = {
      from: { 
        email: APP_EMAIL || "noreply@fakudid.com", 
        name: from_name || "FakUdid App" 
      },
      to: [{ email: to }],
      subject: subject,
      content: body,
      text_content: body.replace(/<[^>]*>/g, ''), // Strip HTML for plain text alternative
    };
    
    console.log("Attempting to send email to:", to);
    
    // Send email using Kit API
    const response = await fetch("https://api.kit.co/v1/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": KIT_API_KEY,
        "X-Api-Secret": KIT_API_SECRET,
      },
      body: JSON.stringify(emailContent),
    });
    
    const responseData = await response.text();
    console.log("Kit API response status:", response.status);
    console.log("Kit API response:", responseData);
    
    if (!response.ok) {
      console.error("Error sending email. Status:", response.status);
      console.error("Error details:", responseData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: responseData }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log("Email sent successfully using Kit");
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
