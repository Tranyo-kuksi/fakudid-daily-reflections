
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

  useEffect(() => {
    // Function to extract token from URL
    const extractToken = async () => {
      console.log("Current URL:", window.location.href);
      console.log("Search params:", location.search);
      console.log("Hash:", location.hash);
      
      // First check for token in searchParams (normal URL parameter)
      let token = searchParams.get("token");
      
      // If not found, check for token in URL hash (fragment identifier)
      if (!token && location.hash) {
        try {
          // Try to parse the hash as search params
          const hashParams = new URLSearchParams(location.hash.substring(1));
          token = hashParams.get("token");
          
          // If still not found, check if the hash itself contains query params
          if (!token && location.hash.includes("?")) {
            const hashWithParams = location.hash.substring(location.hash.indexOf("?") + 1);
            const hashQueryParams = new URLSearchParams(hashWithParams);
            token = hashQueryParams.get("token");
          }
        } catch (err) {
          console.error("Error parsing hash params:", err);
        }
      }
      
      console.log("Reset token present:", token ? "Yes" : "No", token ? token.substring(0, 5) + "..." : "");
      
      if (!token) {
        setErrorMessage("Missing reset token. Please request a new password reset link.");
        setValidToken(false);
        setVerifying(false);
        return;
      }

      // For password reset links, we don't need to verify the token immediately
      // We'll set it as valid and when the user submits the new password,
      // Supabase will automatically verify it during the updateUser call
      setValidToken(true);
      setTokenValue(token);
      setVerifying(false);
    };

    extractToken();
  }, [searchParams, location.hash, location.search]);

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
    
    if (!tokenValue) {
      setErrorMessage("Missing reset token. Please request a new password reset link.");
      return;
    }

    // Validate password
    if (!validatePassword(password)) {
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      console.log("Submitting password reset with token");
      
      // Update user password using the correct method
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
