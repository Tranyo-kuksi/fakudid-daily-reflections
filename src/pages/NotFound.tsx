
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-7xl font-bold text-fakudid-purple mb-4">404</h1>
      <p className="text-xl mb-6">Oops! This page doesn't exist</p>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button asChild className="bg-fakudid-purple hover:bg-fakudid-darkPurple">
        <Link to="/">Return to Journal</Link>
      </Button>
    </div>
  );
};

export default NotFound;
