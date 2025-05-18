
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface ResetPasswordFormProps {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  validationErrors: string[];
  errorMessage: string;
  submitting: boolean;
  handleSubmit: (e: FormEvent) => void;
}

export const ResetPasswordForm = ({ 
  password, 
  setPassword, 
  confirmPassword, 
  setConfirmPassword, 
  showPassword, 
  setShowPassword, 
  validationErrors, 
  errorMessage, 
  submitting,
  handleSubmit 
}: ResetPasswordFormProps) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="password">New Password</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
);
