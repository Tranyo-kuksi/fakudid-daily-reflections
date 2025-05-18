
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessStateProps {
  onNavigateToLogin: () => void;
}

export const SuccessState = ({ onNavigateToLogin }: SuccessStateProps) => (
  <div className="flex flex-col items-center gap-2 py-8">
    <CheckCircle className="h-12 w-12 text-green-500" />
    <p className="text-center text-muted-foreground mt-2">
      Your password has been reset successfully.
    </p>
    <p className="text-center text-xs text-muted-foreground mt-1">
      You can now log in with your new password.
    </p>
    <Button 
      variant="default" 
      className="mt-4"
      onClick={onNavigateToLogin}
    >
      Go to Login
    </Button>
  </div>
);
