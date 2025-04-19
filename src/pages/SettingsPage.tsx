
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Flame, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    email_notifications: true
  });
  
  const [streak, setStreak] = useState(7);
  const [language, setLanguage] = useState("en");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [darkMode, setDarkMode] = useState(theme === 'dark');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      // Set the email from the auth user
      setProfile(prev => ({
        ...prev,
        email: user.email || ""
      }));
      
      // Fetch profile data from the profiles table
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('username, email_notifications')
            .eq('id', user.id)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            setProfile(prev => ({
              ...prev,
              username: data.username || "",
              email_notifications: data.email_notifications
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProfile();
    }
  }, [user]);
  
  const handleProfileUpdate = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          email_notifications: profile.email_notifications,
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    setTheme(checked ? 'dark' : 'light');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive" 
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-24 w-24">
                <AvatarFallback>{profile.username ? profile.username.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium">{profile.username || "Not set"}</h3>
                  <div className="flex items-center text-orange-500">
                    <Flame className="h-5 w-5" />
                    <span className="ml-1">{streak} day streak</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  placeholder="Set your username"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
            
            <Button onClick={handleProfileUpdate} disabled={loading}>
              Save Profile Changes
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>Customize your journal experience</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="subscription">Subscription Plan</Label>
                <Select value={subscriptionPlan} onValueChange={setSubscriptionPlan}>
                  <SelectTrigger id="subscription">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium ($4.99/month)</SelectItem>
                    <SelectItem value="family">Family ($9.99/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={darkMode}
                  onCheckedChange={handleDarkModeChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get reminders to journal daily</p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={profile.email_notifications}
                  onCheckedChange={(checked) => setProfile({...profile, email_notifications: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Data</CardTitle>
            <CardDescription>Manage how your journal data is used</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-backup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">Backup your journal to the cloud</p>
              </div>
              <Switch id="data-backup" defaultChecked />
            </div>
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start">Export Journal Data</Button>
              <Button variant="outline" className="justify-start text-destructive hover:text-destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
