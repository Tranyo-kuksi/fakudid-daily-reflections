
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { NavbarProvider } from "@/contexts/NavbarContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

// Pages
import JournalPage from "./pages/JournalPage";
import HistoryPage from "./pages/HistoryPage";
import MoodTrackerPage from "./pages/MoodTrackerPage";
import SettingsPage from "./pages/SettingsPage";
import CustomizePage from "./pages/CustomizePage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import AuthVerifyPage from "./pages/AuthVerifyPage";
import AuthResetPage from "./pages/AuthResetPage";
import EmailTest from "./pages/EmailTest"; // Import the email test page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <NavbarProvider>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/verify" element={<AuthVerifyPage />} />
                  <Route path="/auth/reset" element={<AuthResetPage />} />
                  <Route path="/" element={
                    <PrivateRoute>
                      <SidebarProvider>
                        <Layout><JournalPage /></Layout>
                      </SidebarProvider>
                    </PrivateRoute>
                  } />
                  <Route path="/entry/:id" element={
                    <PrivateRoute>
                      <SidebarProvider>
                        <Layout><JournalPage /></Layout>
                      </SidebarProvider>
                    </PrivateRoute>
                  } />
                  <Route path="/history" element={
                    <PrivateRoute>
                      <SidebarProvider>
                        <Layout><HistoryPage /></Layout>
                      </SidebarProvider>
                    </PrivateRoute>
                  } />
                  <Route path="/mood-tracker" element={
                    <PrivateRoute>
                      <SidebarProvider>
                        <Layout><MoodTrackerPage /></Layout>
                      </SidebarProvider>
                    </PrivateRoute>
                  } />
                  <Route path="/customize" element={
                    <PrivateRoute>
                      <SidebarProvider>
                        <Layout><CustomizePage /></Layout>
                      </SidebarProvider>
                    </PrivateRoute>
                  } />
                  <Route path="/settings" element={
                    <PrivateRoute>
                      <SidebarProvider>
                        <Layout><SettingsPage /></Layout>
                      </SidebarProvider>
                    </PrivateRoute>
                  } />
                  <Route path="/email-test" element={
                    <PrivateRoute>
                      <SidebarProvider>
                        <Layout><EmailTest /></Layout>
                      </SidebarProvider>
                    </PrivateRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NavbarProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
