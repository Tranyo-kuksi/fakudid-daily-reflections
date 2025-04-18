
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Flame, Upload } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  const [user, setUser] = useState({
    name: "Alex Smith",
    email: "alex@example.com",
    profileImage: "",
  });
  
  const [streak, setStreak] = useState(7);
  const [language, setLanguage] = useState("en");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [notifications, setNotifications] = useState(true);
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImage || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium">{user.name}</h3>
                  <div className="flex items-center text-orange-500">
                    <Flame className="h-5 w-5" />
                    <span className="ml-1">{streak} day streak</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Change Photo
                </Button>
              </div>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={user.name}
                  onChange={(e) => setUser({...user, name: e.target.value})}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user.email}
                  onChange={(e) => setUser({...user, email: e.target.value})}
                />
              </div>
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
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get reminders to journal daily</p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notifications}
                  onCheckedChange={setNotifications}
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
