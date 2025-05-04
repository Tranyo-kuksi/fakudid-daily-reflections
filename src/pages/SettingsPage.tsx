
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch"; 
import { LogOut, Crown, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";
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
    email_notifications: true,
    allow_mature_content: false
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
            .select('username, email_notifications, allow_mature_content')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            toast.error("Failed to load profile data");
            return;
          }
          
          if (data) {
            setProfile(prev => ({
              ...prev,
              username: data.username || "",
              email_notifications: data.email_notifications !== null ? data.email_notifications : true,
              allow_mature_content: data.allow_mature_content !== null ? data.allow_mature_content : false
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          toast.error("Failed to load profile data");
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
          allow_mature_content: profile.allow_mature_content
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
            {isSubscribed ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">Premium Subscription Active</h3>
                </div>
                
                <p className="text-amber-700 dark:text-amber-400 text-sm break-words">
                  Your premium subscription renews on {formatSubscriptionEnd(subscriptionEnd)}.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50 w-full sm:w-auto"
                    onClick={openCustomerPortal}
                  >
                    Manage Subscription
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg border-2 border-amber-300 dark:border-amber-600">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 opacity-20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tl from-amber-300 via-amber-400 to-amber-500 opacity-20 rounded-full blur-xl animate-pulse"></div>
                
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/60 dark:to-amber-900/60 p-6 relative">
                  <div className="absolute top-2 right-2">
                    <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full p-2 bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg">
                        <Crown className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300">
                        Upgrade to Premium
                      </h3>
                    </div>
                    
                    <p className="text-amber-700 dark:text-amber-400">
                      Unlock AI journal prompts and enhance your journaling experience!
                    </p>
                    
                    <div className="rounded-lg bg-white/70 dark:bg-black/20 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Personalized AI journal prompts</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Smart writing suggestions</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Premium template customization</span>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full relative overflow-hidden group mt-2"
                      onClick={openCheckout}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-300 to-amber-500 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                      <span className="flex items-center justify-center gap-2">
                        <Crown className="h-5 w-5" />
                        Upgrade Now - $3.99/month
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <div>
                    <Label htmlFor="mature-content">18+ Mode</Label>
                    <p className="text-sm text-muted-foreground">Allow journal prompts to include more mature language</p>
                  </div>
                  <div className="mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <Switch 
                  id="mature-content" 
                  checked={profile.allow_mature_content}
                  onCheckedChange={(checked) => setProfile({...profile, allow_mature_content: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
