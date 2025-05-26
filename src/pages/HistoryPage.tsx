
import { useState, useEffect } from "react";
import { Calendar, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllEntries, JournalEntry } from "@/services/journalService";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const HistoryPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const allEntries = await getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMoodColor = (mood: JournalEntry['mood']) => {
    switch (mood) {
      case "awesome": return "bg-green-500";
      case "good": return "bg-blue-500";
      case "meh": return "bg-yellow-500";
      case "sad": return "bg-orange-500";
      case "dead": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getMoodEmoji = (mood: JournalEntry['mood']) => {
    switch (mood) {
      case "awesome": return "🤩";
      case "good": return "😊";
      case "meh": return "😐";
      case "sad": return "😢";
      case "dead": return "💀";
      default: return "❓";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Journal History</h1>
        </div>
        <div className="text-center py-8">Loading your entries...</div>
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
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
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
                        className={`${getMoodColor(entry.mood)} text-white border-0`}
                      >
                        {getMoodEmoji(entry.mood)} {entry.mood}
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
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
