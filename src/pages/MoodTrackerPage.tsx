import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  getAllEntries, 
  JournalEntry 
} from "@/services/journalService";
import { AttachmentViewer } from "@/components/attachments/AttachmentViewer";

interface MoodTrackerPageProps {
  // No props needed for now
}

export default function MoodTrackerPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  useEffect(() => {
    const allEntries = getAllEntries();
    setEntries(allEntries);
  }, []);
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getMoodIcon = (mood: string | null) => {
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
  
  const getMoodLabel = (mood: string | null): string => {
    switch (mood) {
      case "dead":
        return "Dead Inside";
      case "sad":
        return "Shity";
      case "meh":
        return "Meh";
      case "good":
        return "Pretty Good";
      case "awesome":
        return "Fucking AWESOME";
      default:
        return "No Mood";
    }
  };
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    
    const entryForDate = entries.find(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === date.getFullYear() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getDate() === date.getDate()
      );
    });
    
    setSelectedEntry(entryForDate || null);
  };
  
  const renderCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days: JSX.Element[] = [];
    
    // Add empty days for the days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(currentYear, currentMonth, i);
      const entryForDay = entries.find(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getFullYear() === dayDate.getFullYear() &&
          entryDate.getMonth() === dayDate.getMonth() &&
          entryDate.getDate() === dayDate.getDate()
        );
      });
      
      days.push(
        <div
          key={i}
          className="p-2 cursor-pointer hover:bg-secondary rounded-md transition-colors"
          onClick={() => handleDayClick(dayDate)}
        >
          <Badge 
            variant={entryForDay ? "default" : "outline"}
            className="w-full h-full flex items-center justify-center"
          >
            {i}
          </Badge>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Mood Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            <div className="text-center text-muted-foreground">Sun</div>
            <div className="text-center text-muted-foreground">Mon</div>
            <div className="text-center text-muted-foreground">Tue</div>
            <div className="text-center text-muted-foreground">Wed</div>
            <div className="text-center text-muted-foreground">Thu</div>
            <div className="text-center text-muted-foreground">Fri</div>
            <div className="text-center text-muted-foreground">Sat</div>
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>
      
      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && formatDate(selectedDate)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Mood:</span>
                <div className="flex items-center gap-1">
                  {getMoodIcon(selectedEntry.mood)}
                  <span>{getMoodLabel(selectedEntry.mood)}</span>
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Journal Entry:</p>
                <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
                  {selectedEntry.content || <span className="text-muted-foreground italic">No content for this day</span>}
                </div>
              </div>
              
              {selectedEntry.attachments && selectedEntry.attachments.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Attachments:</p>
                  <AttachmentViewer attachments={selectedEntry.attachments} size="medium" />
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No journal entry for this day</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
