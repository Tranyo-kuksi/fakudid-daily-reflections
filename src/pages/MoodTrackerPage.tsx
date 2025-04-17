
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data - this would come from a database in a real app
const MOCK_MOOD_DATA = [
  { date: new Date(2023, 3, 1), mood: "good" },
  { date: new Date(2023, 3, 2), mood: "meh" },
  { date: new Date(2023, 3, 3), mood: "good" },
  { date: new Date(2023, 3, 4), mood: "awesome" },
  { date: new Date(2023, 3, 5), mood: "awesome" },
  { date: new Date(2023, 3, 6), mood: "sad" },
  { date: new Date(2023, 3, 7), mood: "sad" },
  { date: new Date(2023, 3, 8), mood: "dead" },
  { date: new Date(2023, 3, 9), mood: "meh" },
  { date: new Date(2023, 3, 10), mood: "good" },
  { date: new Date(2023, 3, 11), mood: "good" },
  { date: new Date(2023, 3, 12), mood: "awesome" },
  { date: new Date(2023, 3, 13), mood: "sad" },
  { date: new Date(2023, 3, 14), mood: "meh" },
  { date: new Date(2023, 3, 15), mood: "dead" },
  { date: new Date(2023, 3, 16), mood: "meh" },
  { date: new Date(2023, 3, 17), mood: "good" },
];

export default function MoodTrackerPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get the mood for a specific date
  const getMoodForDate = (date: Date) => {
    const moodEntry = MOCK_MOOD_DATA.find(
      entry => entry.date.toDateString() === date.toDateString()
    );
    return moodEntry ? moodEntry.mood : null;
  };
  
  // Generate calendar data
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for the days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };
  
  // Get color class based on mood
  const getMoodColorClass = (mood: string | null) => {
    switch (mood) {
      case "dead":
        return "bg-mood-dead";
      case "sad":
        return "bg-mood-sad";
      case "meh":
        return "bg-mood-meh";
      case "good":
        return "bg-mood-good";
      case "awesome":
        return "bg-mood-awesome";
      default:
        return "bg-gray-200 dark:bg-gray-700";
    }
  };
  
  // Get icon based on mood
  const getMoodIcon = (mood: string | null) => {
    switch (mood) {
      case "dead":
        return <Skull className="h-5 w-5 text-white" />;
      case "sad":
        return <FrownIcon className="h-5 w-5 text-white" />;
      case "meh":
        return <MehIcon className="h-5 w-5 text-white" />;
      case "good":
        return <SmileIcon className="h-5 w-5 text-white" />;
      case "awesome":
        return <PartyPopper className="h-5 w-5 text-white" />;
      default:
        return null;
    }
  };
  
  // Navigate between months
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };
  
  // Generate mood summary
  const generateMoodSummary = () => {
    const moodsInMonth = MOCK_MOOD_DATA.filter(entry => {
      return entry.date.getMonth() === currentMonth.getMonth() && 
             entry.date.getFullYear() === currentMonth.getFullYear();
    }).map(entry => entry.mood);
    
    const moodCounts: Record<string, number> = {
      awesome: 0,
      good: 0,
      meh: 0,
      sad: 0,
      dead: 0
    };
    
    moodsInMonth.forEach(mood => {
      if (mood in moodCounts) {
        moodCounts[mood]++;
      }
    });
    
    const mostFrequentMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    let summaryText = "";
    
    switch (mostFrequentMood) {
      case "awesome":
        summaryText = "You were feeling fucking AWESOME most of this month!";
        break;
      case "good":
        summaryText = "You were mostly feeling pretty good this month!";
        break;
      case "meh":
        summaryText = "You were feeling meh most of this month.";
        break;
      case "sad":
        summaryText = "You were feeling shitty most of this month.";
        break;
      case "dead":
        summaryText = "You were feeling dead inside most of this month.";
        break;
      default:
        summaryText = "Not enough data to generate a mood summary.";
    }
    
    return summaryText;
  };
  
  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Mood Tracker</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              &lt;
            </button>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              &gt;
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center font-medium text-sm p-2">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="p-2"></div>;
              }
              
              const mood = getMoodForDate(day);
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              
              return (
                <div 
                  key={day.toDateString()} 
                  className={`p-1 rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-fakudid-purple' : ''
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`h-full w-full rounded-md flex flex-col items-center justify-center p-2 ${
                    mood ? getMoodColorClass(mood) : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                    <div className="text-xs mb-1 text-center">
                      {day.getDate()}
                    </div>
                    <div>
                      {getMoodIcon(mood)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{generateMoodSummary()}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-mood-awesome text-white flex items-center gap-1">
              <PartyPopper className="h-4 w-4" /> Fucking AWESOME
            </Badge>
            <Badge className="bg-mood-good text-white flex items-center gap-1">
              <SmileIcon className="h-4 w-4" /> Pretty Good
            </Badge>
            <Badge className="bg-mood-meh text-white flex items-center gap-1">
              <MehIcon className="h-4 w-4" /> Meh
            </Badge>
            <Badge className="bg-mood-sad text-white flex items-center gap-1">
              <FrownIcon className="h-4 w-4" /> Shity
            </Badge>
            <Badge className="bg-mood-dead text-white flex items-center gap-1">
              <Skull className="h-4 w-4" /> Dead Inside
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
