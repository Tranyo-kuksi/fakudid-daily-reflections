
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

    // Format email with proper headers for better deliverability
    const emailContent = {
      personalizations: [{ to: [{ email: to }] }],
      subject: subject,
      content: [{ type: "text/html", value: body }],
      from: { email: Deno.env.get("APP_EMAIL_ADDRESS") || "noreply@fakudid.com", name: from_name || "FakUdid App" },
      reply_to: { email: Deno.env.get("REPLY_TO_EMAIL") || "support@fakudid.com", name: "FakUdid Support" },
    };
    
    // Send email using SendGrid API
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    
    if (!SENDGRID_API_KEY) {
      console.error("Missing SENDGRID_API_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Email sending is not configured properly" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(emailContent),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error sending email:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: errorData }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log("Email sent successfully");
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
