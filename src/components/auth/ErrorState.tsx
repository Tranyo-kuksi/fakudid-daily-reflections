
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  errorMessage: string;
  onNavigateToLogin: () => void;
}

export const ErrorState = ({ errorMessage, onNavigateToLogin }: ErrorStateProps) => (
  <div className="flex flex-col items-center gap-2 py-8">
    <XCircle className="h-12 w-12 text-destructive" />
    <p className="text-center text-destructive mt-2">
      {errorMessage}
    </p>
    <p className="text-center text-xs text-muted-foreground mt-2">
      If you need to reset your password, you can request a new reset link from the login page.
    </p>
    <Button 
      variant="outline" 
      className="mt-4"
      onClick={onNavigateToLogin}
    >
      Go to Login
    </Button>
  </div>
);
