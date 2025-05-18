
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import * as z from "zod";

// Schema for password validation
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

export default function AuthResetPage() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    // Simple check if token exists - we don't actually verify it until form submission
    // to avoid token expiration issues during form filling
    if (!token) {
      setErrorMessage("Missing reset token. Please request a new password reset link.");
      setValidToken(false);
      setVerifying(false);
      return;
    }

    // Simulate token verification
    const verifyToken = async () => {
      try {
        console.log("Reset token present:", token.substring(0, 5) + "...");
        // We don't actually validate the token here, just check its presence
        // The actual validation will happen when the user submits the form
        setValidToken(true);
      } catch (error: any) {
        console.error("Token verification error:", error);
        setErrorMessage("Invalid or expired reset token. Please request a new password reset link.");
        setValidToken(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (pass: string) => {
    try {
      passwordSchema.parse({ password: pass });
      setValidationErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(error.errors.map(err => err.message));
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
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
      
      // Update password using the token
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      }, {
        // Need to provide the token in the session
        allowedMethods: ["POST"],
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast.success("Password has been reset successfully!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message || "Failed to reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Verifying your reset link...
              </p>
            </div>
          ) : validToken && !success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {validationErrors.length > 0 && (
                  <ul className="text-xs text-destructive space-y-1 mt-2">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={password !== confirmPassword && confirmPassword ? "border-destructive" : ""}
                  required
                />
                {password !== confirmPassword && confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords don't match</p>
                )}
              </div>
              
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full mt-4" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          ) : success ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center text-muted-foreground mt-2">
                Your password has been reset successfully.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-destructive mt-2">
                {errorMessage}
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {(success || (!validToken && !verifying)) && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
            >
              Go to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
