
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch"; 
import { LogOut, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { isSubscribed, subscriptionEnd, openCheckout, openCustomerPortal } = useSubscription();
  
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    email_notifications: true
  });
  
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  
  // Format subscription end date
  const formatSubscriptionEnd = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
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
      
      toast.success("Your profile has been updated.");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile. Please try again.");
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
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
                <h3 className="text-xl font-medium">{profile.username || "Not set"}</h3>
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
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your premium features</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 dark:from-amber-950/30 dark:via-yellow-900/30 dark:to-amber-950/30 p-4 sm:p-6 rounded-lg border border-amber-200 dark:border-amber-800 max-w-full">
              {isSubscribed ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">Premium Subscription Active</h3>
                  </div>
                  
                  <p className="text-amber-700 dark:text-amber-400">
                    Your premium subscription renews on {formatSubscriptionEnd(subscriptionEnd)}.
                  </p>
                  
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button 
                      variant="outline" 
                      className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50"
                      onClick={openCustomerPortal}
                    >
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium">Upgrade to Premium</h3>
                  </div>
                  
                  <p className="text-muted-foreground break-words">
                    Unlock AI-powered journal prompts and enhance your journaling experience.
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="bg-green-500 rounded-full p-0.5 text-white shrink-0">✓</span>
                      <span>Unlimited AI journal prompts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-green-500 rounded-full p-0.5 text-white shrink-0">✓</span>
                      <span>Personalized writing suggestions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-green-500 rounded-full p-0.5 text-white shrink-0">✓</span>
                      <span>Premium support</span>
                    </li>
                  </ul>
                  
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-900 w-full sm:w-auto"
                    onClick={openCheckout}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now - $3.99/month
                  </Button>
                </div>
              )}
            </div>
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
            </div>
            
            <div className="space-y-4">
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
      </div>
    </div>
  );
}
