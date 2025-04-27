
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Mail } from "lucide-react";

type AuthMode = "login" | "register" | "forgotPassword" | "resetPassword";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else if (mode === "register") {
        // First sign up the user
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        // Then update their profile with the username
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ username })
            .eq('id', data.user.id);

          if (profileError) throw profileError;
        }

        toast.success("Registration successful! Please verify your email.");
      } else if (mode === "forgotPassword") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=resetPassword`,
        });
        
        if (error) throw error;
        
        setResetSent(true);
        toast.success("Password reset email sent. Please check your inbox.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === "login" 
              ? "Login" 
              : mode === "register" 
                ? "Register" 
                : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Welcome back! Please login to your account."
              : mode === "register"
                ? "Create a new account to get started."
                : "Enter your email to receive a password reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "forgotPassword" && resetSent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto rounded-full bg-primary/20 p-3 w-fit">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to your email address.
              </p>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => setMode("login")}
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {mode !== "forgotPassword" && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              {mode === "register" && (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading 
                  ? "Loading..." 
                  : mode === "login" 
                    ? "Login" 
                    : mode === "register" 
                      ? "Register" 
                      : "Send Reset Link"}
              </Button>
              
              <div className="flex flex-col space-y-2 text-center text-sm mt-4">
                {mode === "login" && (
                  <>
                    <Button
                      variant="link"
                      className="text-xs"
                      onClick={() => setMode("forgotPassword")}
                    >
                      Forgot your password?
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => setMode("register")}
                      className="text-sm"
                    >
                      Don't have an account? Register
                    </Button>
                  </>
                )}
                {mode === "register" && (
                  <Button
                    variant="link"
                    onClick={() => setMode("login")}
                    className="text-sm"
                  >
                    Already have an account? Login
                  </Button>
                )}
                {mode === "forgotPassword" && (
                  <Button
                    variant="link"
                    onClick={() => setMode("login")}
                    className="text-sm"
                  >
                    Remember your password? Login
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
