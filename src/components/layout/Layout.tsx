
import { ReactNode, useState, useRef, useEffect } from "react";
import { NavBar } from "./NavBar";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarRail, 
  SidebarInset
} from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { Home, History, BarChart2, Settings, Palette, ChevronUp } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [footerVisible, setFooterVisible] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { path: "/", label: "Journal", icon: Home },
    { path: "/history", label: "History", icon: History },
    { path: "/mood-tracker", label: "Mood Tracker", icon: BarChart2 },
    { path: "/customize", label: "Customize", icon: Palette },
    { path: "/settings", label: "Settings", icon: Settings },
  ];
  
  // Handle touch events for pull-to-reveal
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (startY === null || currentY === null) return;
    
    // If pulled up more than 40px, show the footer
    if (startY - currentY > 40) {
      setFooterVisible(true);
    }
    
    // Reset values
    setStartY(null);
    setCurrentY(null);
  };

  // Close footer when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (footerRef.current && !footerRef.current.contains(event.target as Node) && footerVisible) {
        setFooterVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [footerVisible]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="bg-background border-r">
          <SidebarHeader className="flex items-center justify-center p-4 border-b">
            <span className="text-xl font-bold text-fakudid-purple">FakUdid</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.label}
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div 
            className="flex flex-col min-h-full relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <NavBar />
            <main className="flex-1">
              <div className="container py-4">{children}</div>
            </main>
            
            {/* Pull indicator - only shown when not pulled */}
            {!footerVisible && (
              <div className="flex justify-center absolute bottom-0 left-0 right-0 py-1 text-muted-foreground">
                <ChevronUp size={16} />
              </div>
            )}
            
            {/* Footer with pull-to-reveal */}
            <div 
              ref={footerRef}
              className={`bg-background border-t py-4 absolute bottom-0 left-0 right-0 transform transition-transform duration-300 ${
                footerVisible ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              <div className="container text-center text-sm text-muted-foreground">
                FakUdid Journal App — All data is stored locally on your device.
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
