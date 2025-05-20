
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { useNavbar } from "@/contexts/NavbarContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useNavbar();
  const [showFooter, setShowFooter] = useState(true);
  
  // Hide footer when keyboard is open on mobile
  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const bodyHeight = document.body.clientHeight;
      // If window height is significantly smaller than body height, keyboard is likely open
      setShowFooter(windowHeight > bodyHeight * 0.8);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background w-full">
      <NavBar />
      <main className={`flex-1 pt-14 ${isOpen ? "ml-64" : "ml-0"} transition-all duration-300`}>
        {children}
      </main>
      {showFooter && (
        <footer className="text-center p-3 text-xs text-muted-foreground border-t">
          <p>Your data is securely stored in the cloud and synced across your devices.</p>
          <p className="mt-1">© {new Date().getFullYear()} FakUdid App. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}
