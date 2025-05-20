
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

// Interface for Supabase Auth emails
interface SupabaseAuthEmailRequest {
  template?: string;
  user_id?: string;
  email?: string;
  data?: {
    token?: string;
    redirect_to?: string;
    [key: string]: any;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body));

    let to: string = "";
    let subject: string = "";
    let emailBody: string = "";
    let fromName: string = "";

    // Check if this is a custom email or an auth email from Supabase
    const isAuthEmail = body.template || body.user_id || body.email;
    
    if (isAuthEmail) {
      // This is a Supabase Auth email
      const authRequest = body as SupabaseAuthEmailRequest;
      console.log("Processing auth email request:", authRequest.template);
      
      to = authRequest.email || "";
      const templateType = authRequest.template || "unknown";
      
      // Set appropriate subject and content based on template type
      if (templateType === "confirmation") {
        subject = "Confirm Your Email Address";
        emailBody = generateConfirmationEmail(authRequest.data);
        fromName = "Email Verification";
      } else if (templateType === "recovery") {
        subject = "Reset Your Password";
        emailBody = generateRecoveryEmail(authRequest.data);
        fromName = "Password Reset";
      } else if (templateType === "invite") {
        subject = "You've Been Invited";
        emailBody = generateInviteEmail(authRequest.data);
        fromName = "Account Invitation";
      } else {
        console.error("Unknown template type:", templateType);
        return new Response(
          JSON.stringify({ error: `Unknown template type: ${templateType}` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    } else {
      // This is a custom email
      const emailRequest = body as EmailRequest;
      
      // Validate required fields for custom emails
      if (!emailRequest.to || !emailRequest.subject || !emailRequest.body) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: to, subject, body" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      to = emailRequest.to;
      subject = emailRequest.subject;
      emailBody = emailRequest.body;
      fromName = emailRequest.from_name || "FakUdid App";
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
    console.log("- APP_EMAIL_ADDRESS value:", APP_EMAIL);
    
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
    
    // Use the configured email address or fallback to default
    const emailAddress = APP_EMAIL || "noreply@fakudid.com";
    
    console.log("Attempting to send email to:", to);
    console.log("From email address:", emailAddress);
    console.log("Email subject:", subject);
    
    // Send email using Kit API with the CORRECT endpoint (kitapi.dev instead of kit.co)
    const response = await fetch("https://api.kitapi.dev/v1/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": KIT_API_KEY,
        "X-Api-Secret": KIT_API_SECRET,
      },
      body: JSON.stringify({
        from: { 
          email: emailAddress, 
          name: fromName || "FakUdid App" 
        },
        to: [{ email: to }],
        subject: subject,
        html: emailBody,
        text: emailBody.replace(/<[^>]*>/g, ''), // Fixed: use html and text fields instead of content/text_content
      }),
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
  } catch (error: any) {
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

// Helper functions to generate email content for auth templates with correct Supabase auth URLs
function generateConfirmationEmail(data: any): string {
  const token = data?.token || "";
  const redirectTo = data?.redirect_to || "";
  // Use the correct domain for auth verification links
  const actionUrl = `https://fnzkkyhhqxrbyhslwply.supabase.co/auth/v1/verify?token=${token}&type=signup&redirect_to=${redirectTo}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Confirm Your Email</h1>
      <p>Thank you for signing up! Please confirm your email by clicking the button below:</p>
      <a href="${actionUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Confirm Email
      </a>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666;">${actionUrl}</p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    </div>
  `;
}

function generateRecoveryEmail(data: any): string {
  const token = data?.token || "";
  
  // Generate a URL that works consistently and explicitly includes the token type
  const userOrigin = data?.redirect_to?.split('/auth')[0] || "https://fakudid.com";
  // Make sure to include access_token and type=recovery in the URL for proper token exchange
  const actionUrl = `${userOrigin}/auth/reset#access_token=${token}&type=recovery`;
  
  console.log("Generated password reset URL:", actionUrl);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Reset Your Password</h1>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${actionUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666;">${actionUrl}</p>
      <p>If you're using the mobile app, you may need to open this link in your browser.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>This link will expire in 24 hours for security reasons.</p>
    </div>
  `;
}

function generateInviteEmail(data: any): string {
  const token = data?.token || "";
  const redirectTo = data?.redirect_to || "";
  // Use the correct domain for auth verification links
  const actionUrl = `https://fnzkkyhhqxrbyhslwply.supabase.co/auth/v1/verify?token=${token}&type=invite&redirect_to=${redirectTo}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">You've Been Invited</h1>
      <p>You've been invited to join our platform. Click the button below to accept the invitation:</p>
      <a href="${actionUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Accept Invitation
      </a>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666;">${actionUrl}</p>
    </div>
  `;
}

serve(handler);
