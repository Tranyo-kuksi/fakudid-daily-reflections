import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

// Components moved to separate files for better organization
import { LoadingState } from "@/components/auth/LoadingState";
import { ErrorState } from "@/components/auth/ErrorState";
import { SuccessState } from "@/components/auth/SuccessState";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function AuthResetPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [tokenValue, setTokenValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Function to extract token from URL (both query param and hash)
  const extractTokenFromUrl = () => {
    console.log("Current URL:", window.location.href);
    console.log("Search params:", location.search);
    console.log("Hash:", location.hash);
    
    // First check for token in searchParams (normal URL parameter)
    let token = searchParams.get("token");
    let type = searchParams.get("type") || "recovery";
    
    // If not found, check for token in URL hash (fragment identifier)
    if (!token && location.hash) {
      try {
        // Try to parse the hash as search params
        const hashParams = new URLSearchParams(location.hash.substring(1));
        token = hashParams.get("token") || hashParams.get("access_token");
        type = hashParams.get("type") || type;
        
        // If still not found, check if the hash itself contains query params
        if (!token && location.hash.includes("?")) {
          const hashWithParams = location.hash.substring(location.hash.indexOf("?") + 1);
          const hashQueryParams = new URLSearchParams(hashWithParams);
          token = hashQueryParams.get("token") || hashQueryParams.get("access_token");
          type = hashQueryParams.get("type") || type;
        }

        // Check if token might be in a different format (for Capacitor/mobile)
        if (!token && (location.hash.includes("token=") || location.hash.includes("access_token="))) {
          const hashContent = location.hash.substring(1);
          const tokenMatch = hashContent.match(/(?:token|access_token)=([^&]+)/);
          if (tokenMatch && tokenMatch[1]) {
            token = tokenMatch[1];
          }
        }
      } catch (err) {
        console.error("Error parsing hash params:", err);
      }
    }
    
    console.log("Reset token present:", token ? "Yes" : "No", token ? token.substring(0, 5) + "..." : "");
    console.log("Token type:", type);
    
    return { token, type };
  };

  // Set up listeners for auth state changes first
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed. Event:", event);
      console.log("Session present:", session ? "Yes" : "No");
      
      if (event === "PASSWORD_RECOVERY" && session) {
        console.log("Password recovery event detected with valid session");
        setValidToken(true);
        setVerifying(false);
      } else if (session) {
        console.log("Session detected but not PASSWORD_RECOVERY event");
        setValidToken(true);
        setVerifying(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Then try to get session from URL and handle initial state
  useEffect(() => {
    const initializePasswordReset = async () => {
      try {
        // Try to get session from URL for hash-based tokens
        // Using exchangeCodeForSession instead of getSessionFromUrl which is not available
        
        // Extract token information
        const { token, type } = extractTokenFromUrl();
        
        if (!token) {
          setErrorMessage("Missing reset token. Please request a new password reset link.");
          setValidToken(false);
          setVerifying(false);
          return;
        }

        // Store token value for later use
        setTokenValue(token);
        
        // Get current session to check if we're already authenticated
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("User already has a session");
          setValidToken(true);
          setVerifying(false);
          return;
        }
        
        // If not authenticated yet, we need to exchange the token for a session
        console.log("Attempting to exchange token for session...");
        const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(token);
        
        if (exchangeError) {
          console.error("Error exchanging token for session:", exchangeError);
          setErrorMessage("Invalid or expired reset token. Please request a new password reset link.");
          setValidToken(false);
          setVerifying(false);
          return;
        }
        
        console.log("Session created successfully:", exchangeData?.session ? "Yes" : "No");
        setValidToken(true);
        setVerifying(false);
      } catch (error) {
        console.error("Error during password reset initialization:", error);
        setErrorMessage("An error occurred while verifying your reset token. Please request a new password reset link.");
        setValidToken(false);
        setVerifying(false);
      }
    };

    initializePasswordReset();
  }, [location, searchParams]);

  const validatePassword = (pass: string) => {
    const errors = [];
    
    if (pass.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[A-Z]/.test(pass)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(pass)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/[0-9]/.test(pass)) {
      errors.push("Password must contain at least one number");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    // Validate password
    if (!validatePassword(password)) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      console.log("Submitting password reset");
      
      // Get current session to ensure we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("Authentication session expired. Please request a new password reset link.");
      }
      
      // Now we can update the user's password because we have a valid session
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }
      
      setSuccess(true);
      toast.success("Password has been reset successfully!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message || "Failed to reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNavigateToLogin = () => navigate("/auth");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {verifying 
              ? "Verifying your reset link..." 
              : validToken && !success
                ? "Create a new password for your account" 
                : success
                  ? "Password reset successful!"
                  : "Reset link verification failed"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {verifying ? (
            <LoadingState />
          ) : validToken && !success ? (
            <ResetPasswordForm 
              password={password}
              setPassword={(value) => {
                setPassword(value);
                validatePassword(value);
              }}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              validationErrors={validationErrors}
              errorMessage={errorMessage}
              submitting={submitting}
              handleSubmit={handleSubmit}
            />
          ) : success ? (
            <SuccessState onNavigateToLogin={handleNavigateToLogin} />
          ) : (
            <ErrorState 
              errorMessage={errorMessage} 
              onNavigateToLogin={handleNavigateToLogin} 
            />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {(success || (!validToken && !verifying)) && (
            <Button 
              variant="outline" 
              onClick={handleNavigateToLogin}
            >
              Go to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
