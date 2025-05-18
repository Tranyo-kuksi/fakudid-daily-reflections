
import { Loader2 } from "lucide-react";

export const LoadingState = () => (
  <div className="flex flex-col items-center gap-2 py-8">
    <Loader2 className="h-12 w-12 text-primary animate-spin" />
    <p className="text-center text-sm text-muted-foreground mt-2">
      Verifying your reset link...
    </p>
  </div>
);
