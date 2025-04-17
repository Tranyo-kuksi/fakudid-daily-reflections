
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper } from "lucide-react";

// Mock data for journal entries
const MOCK_ENTRIES = [
  {
    id: 1,
    date: new Date('2023-04-17'),
    content: "Today was an amazing day! I aced my math test and hung out with friends after school. We went to the mall and got ice cream. It was exactly what I needed after a stressful week.",
    mood: "awesome"
  },
  {
    id: 2,
    date: new Date('2023-04-16'),
    content: "School was okay today. Nothing special happened. I'm looking forward to the weekend though. Might play some video games tonight to relax.",
    mood: "meh"
  },
  {
    id: 3,
    date: new Date('2023-04-15'),
    content: "Got into an argument with my parents about my phone usage. I understand their concerns but I wish they'd trust me more. Feeling frustrated.",
    mood: "sad"
  },
  {
    id: 4,
    date: new Date('2023-04-14'),
    content: "Had a great day at soccer practice! Coach said my skills are improving. I'm excited for our game this weekend.",
    mood: "good"
  },
  {
    id: 5,
    date: new Date('2023-04-13'),
    content: "Failed my history test even though I studied so hard. Feeling like nothing I do matters. Just want to sleep all day.",
    mood: "dead"
  },
];

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState(MOCK_ENTRIES);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter entries based on search query
    const filtered = MOCK_ENTRIES.filter(entry => 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.date.toLocaleDateString().includes(searchQuery)
    );
    setEntries(filtered);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "dead":
        return <Skull className="h-5 w-5 text-mood-dead" />;
      case "sad":
        return <FrownIcon className="h-5 w-5 text-mood-sad" />;
      case "meh":
        return <MehIcon className="h-5 w-5 text-mood-meh" />;
      case "good":
        return <SmileIcon className="h-5 w-5 text-mood-good" />;
      case "awesome":
        return <PartyPopper className="h-5 w-5 text-mood-awesome" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Journal History</h1>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          placeholder="Search entries by text or date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline" className="px-3">
          <Search className="h-5 w-5" />
        </Button>
      </form>
      
      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map(entry => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <p className="font-medium">
                  {entry.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div>{getMoodIcon(entry.mood)}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-muted-foreground line-clamp-3">{entry.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No entries found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
