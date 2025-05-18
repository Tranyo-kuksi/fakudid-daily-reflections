
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AuthVerifyPage() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyToken() {
      try {
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        
        if (!token || !type) {
          throw new Error("Missing verification parameters");
        }

        console.log("Verifying token:", { type });
        
        // Handle the verification based on token type
        if (type === "signup" || type === "invite") {
          // Fix: Use the correct parameter structure expected by verifyOtp
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "signup",
          });
          
          if (error) throw error;
          
          setSuccess(true);
          toast.success("Email successfully verified! You can now log in.");
        } else if (type === "recovery") {
          // For recovery tokens, we just validate but don't complete the process here
          // We'll redirect to the reset password page
          navigate(`/auth/reset?token=${token}`);
          return;
        } else {
          throw new Error("Invalid verification type");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setErrorMessage(error.message || "Failed to verify your email. The link may have expired.");
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    }

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {verifying 
              ? "Please wait while we verify your email..." 
              : success 
                ? "Your email has been verified!" 
                : "There was a problem verifying your email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {verifying ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Verifying your email...
              </p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Your email has been successfully verified.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/auth")}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-sm text-destructive mt-2">
                {errorMessage}
              </p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate("/auth")}
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
