import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, Calendar, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  getAllEntries, 
  JournalEntry 
} from "@/services/journalService";
import { AttachmentViewer } from "@/components/attachments/AttachmentViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, getDaysInMonth, getDay, startOfMonth } from "date-fns";
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

export default function MoodTrackerPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<{[key: string]: number}>({});
  const [dominantMood, setDominantMood] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || "";
  
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
    const fetchEntries = async () => {
      const allEntries = await getAllEntries();
      setEntries(allEntries);
      
      // Calculate monthly mood summary
      const summary: {[key: string]: number} = {
        dead: 0,
        sad: 0,
        meh: 0,
        good: 0,
        awesome: 0
      };
      
      const monthDate = currentMonth;
      const selectedMonth = monthDate.getMonth();
      const selectedYear = monthDate.getFullYear();
      
      allEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear && entry.mood) {
          summary[entry.mood] = (summary[entry.mood] || 0) + 1;
        }
      });
      
      setMonthlySummary(summary);
      
      // Determine dominant mood
      let maxCount = 0;
      let dominant: string | null = null;
      
      Object.entries(summary).forEach(([mood, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominant = mood;
        }
      });
      
      setDominantMood(dominant);
    };
    
    fetchEntries();
  }, [currentMonth]);
  
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
        return <PartyPopper className="h-5 w-5 text-gold-dark" />;
      default:
        return null;
    }
  };
  
  const getMoodLabel = (mood: string | null): string => {
    if (!mood) return "No Mood";
    
    const moodMappings = {
      dead: preferences.moodNames.dead,
      sad: preferences.moodNames.sad,
      meh: preferences.moodNames.meh,
      good: preferences.moodNames.good,
      awesome: preferences.moodNames.awesome
    };
    
    return moodMappings[mood as keyof typeof moodMappings] || "Unknown Mood";
  };
  
  const getMoodColor = (mood: string | null): string => {
    switch (mood) {
      case "dead":
        return "bg-mood-dead text-white";
      case "sad":
        return "bg-mood-sad text-white";
      case "meh":
        return "bg-mood-meh text-white";
      case "good":
        return "bg-mood-good text-white";
      case "awesome":
        return "bg-gold-gradient text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  const getMoodTextColor = (mood: string | null): string => {
    switch (mood) {
      case "dead":
        return "text-mood-dead";
      case "sad":
        return "text-mood-sad";
      case "meh":
        return "text-mood-meh";
      case "good":
        return "text-mood-good";
      case "awesome":
        return "text-gold-dark";
      default:
        return "text-muted-foreground";
    }
  };
  
  const handleDayClick = (year: number, month: number, day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    
    const entryForDate = entries.find(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === clickedDate.getFullYear() &&
        entryDate.getMonth() === clickedDate.getMonth() &&
        entryDate.getDate() === clickedDate.getDate()
      );
    });
    
    setSelectedEntry(entryForDate || null);
  };

  const viewFullEntry = (entryId: string) => {
    // Pass search query to the entry view if present
    if (searchQuery) {
      navigate(`/entry/${entryId}?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/entry/${entryId}`);
    }
  };
  
  // Function to highlight search terms in text
  const highlightSearchText = (text: string | null) => {
    const searchQuery = location.search ? new URLSearchParams(location.search).get('search') : null;
    
    if (!searchQuery?.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</mark> 
        : part
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = getDay(startOfMonth(currentMonth));
    const daysInMonth = getDaysInMonth(currentMonth);
    
    const days: JSX.Element[] = [];
    
    // Add empty days for the days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
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
          onClick={() => handleDayClick(year, month, i)}
        >
          <Badge 
            variant={entryForDay ? "default" : "outline"}
            className={`w-full h-full flex items-center justify-center ${entryForDay ? getMoodColor(entryForDay.mood) : ""}`}
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
      {/* Calendar Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold">Mood Tracker</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentMonth}
                className="h-8 px-2 text-sm"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
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
      
      {/* Monthly Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Monthly Summary</CardTitle>
          {dominantMood && (
            <p className="text-muted-foreground">
              You were mostly <span className={`font-semibold ${getMoodTextColor(dominantMood)}`}>
                {getMoodLabel(dominantMood)}
              </span> this month
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-nowrap gap-2 justify-start overflow-x-auto pb-2">
            {Object.entries(monthlySummary).map(([mood, count]) => (
              <div 
                key={mood} 
                className={`px-3 py-2 rounded-lg flex items-center justify-center w-10 h-10 shrink-0 ${getMoodColor(mood)}`}
              >
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
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
          
          <ScrollArea className="max-h-[60vh]">
            {selectedEntry ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Mood:</span>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getMoodColor(selectedEntry.mood)}`}>
                    <span>{getMoodLabel(selectedEntry.mood)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Journal Entry:</p>
                  <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
                    {searchQuery && selectedEntry.content ? (
                      highlightSearchText(selectedEntry.content)
                    ) : (
                      selectedEntry.content || <span className="text-muted-foreground italic">No content for this day</span>
                    )}
                  </div>
                </div>
                
                {selectedEntry.attachments && selectedEntry.attachments.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Attachments:</p>
                    <AttachmentViewer attachments={selectedEntry.attachments} size="medium" />
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => viewFullEntry(selectedEntry.id)}
                    className="text-primary hover:underline font-medium"
                  >
                    View Full Entry
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No journal entry for this day</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
