
import { ReactNode } from "react";
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
import { Home, History, BarChart2, Settings, Palette } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Journal", icon: Home },
    { path: "/history", label: "History", icon: History },
    { path: "/mood-tracker", label: "Mood Tracker", icon: BarChart2 },
    { path: "/customize", label: "Customize", icon: Palette },
    { path: "/settings", label: "Settings", icon: Settings },
  ];
  
  return (
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
      <SidebarInset className="flex-1">
        <div className="flex flex-col min-h-full">
          <NavBar />
          <main className="flex-1">
            <div className="container py-4">{children}</div>
          </main>
          <footer className="bg-background border-t py-4">
            <div className="container text-center text-sm text-muted-foreground">
              FakUdid Journal App — All data is stored locally in your browser.
            </div>
          </footer>
        </div>
      </SidebarInset>
    </div>
  );
};
