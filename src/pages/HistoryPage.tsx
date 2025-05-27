
import { useState, useEffect } from "react";
import { Calendar, Search, Filter, Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllEntries, JournalEntry } from "@/services/journalService";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface MoodPreferences {
  moodNames: {
    dead: string;
    sad: string;
    meh: string;
    good: string;
    awesome: string;
  };
}

const HistoryPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [preferences] = useUserPreferences<MoodPreferences>('mood-preferences', {
    moodNames: {
      dead: "Dead",
      sad: "Sad", 
      meh: "Meh",
      good: "Good",
      awesome: "Awesome"
    }
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading entries from getAllEntries...");
      const allEntries = await getAllEntries();
      console.log("Loaded entries:", allEntries.length);
      setEntries(allEntries);
    } catch (error) {
      console.error("Error loading entries:", error);
      setError("Failed to load journal entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use the loaded preferences to create mood options
  const moodOptions = [
    { name: preferences.moodNames.dead, value: "dead", icon: Skull, color: "text-mood-dead", bgColor: "bg-mood-dead" },
    { name: preferences.moodNames.sad, value: "sad", icon: FrownIcon, color: "text-mood-sad", bgColor: "bg-mood-sad" },
    { name: preferences.moodNames.meh, value: "meh", icon: MehIcon, color: "text-mood-meh", bgColor: "bg-mood-meh" },
    { name: preferences.moodNames.good, value: "good", icon: SmileIcon, color: "text-mood-good", bgColor: "bg-mood-good" },
    { name: preferences.moodNames.awesome, value: "awesome", icon: PartyPopper, color: "text-gold-dark", bgColor: "bg-gold-gradient" }
  ];

  const getMoodInfo = (mood: JournalEntry['mood']) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption || { 
      name: "Unknown", 
      icon: MehIcon, 
      bgColor: "bg-gray-500", 
      color: "text-gray-500" 
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Journal History</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your entries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Journal History</h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadEntries}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Journal History</h1>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">
            {entries.length} entries
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search your entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No entries match your search." : "No journal entries yet. Start writing!"}
              </p>
              {!searchTerm && (
                <Button className="mt-4" asChild>
                  <Link to="/">Write Your First Entry</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => {
            const moodInfo = getMoodInfo(entry.mood);
            const IconComponent = moodInfo.icon;
            return (
              <Link key={entry.id} to={`/entry/${entry.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      {entry.title || "Untitled Entry"}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {entry.mood && (
                        <Badge 
                          variant="secondary" 
                          className={`${moodInfo.bgColor} text-white border-0`}
                        >
                          <IconComponent className="h-4 w-4 mr-1" />
                          {moodInfo.name}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">
                      {entry.content || "No content"}
                    </p>
                    {entry.attachments && entry.attachments.length > 0 && (
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <span>📎 {entry.attachments.length} attachment(s)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
