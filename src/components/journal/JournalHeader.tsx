
import React from "react";
import { Input } from "@/components/ui/input";
import { MoodPicker } from "@/components/journal/MoodPicker";

interface JournalHeaderProps {
  journalTitle: string;
  setJournalTitle: (title: string) => void;
  selectedMood: string | null;
  setSelectedMood: (mood: string | null) => void;
  readOnly: boolean;
  editMode: boolean;
  highlightedTitle: React.ReactNode | null;
  moodNames: {[key: string]: string};
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  journalTitle,
  setJournalTitle,
  selectedMood,
  setSelectedMood,
  readOnly,
  editMode,
  highlightedTitle,
  moodNames
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        {readOnly && !editMode && highlightedTitle ? (
          <div className="text-lg w-full border rounded-md p-2">
            {highlightedTitle || "Untitled"}
          </div>
        ) : (
          <Input
            placeholder="Title your day..."
            className="text-lg w-full"
            value={journalTitle}
            onChange={(e) => setJournalTitle(e.target.value)}
            readOnly={readOnly && !editMode}
          />
        )}
      </div>
      
      <MoodPicker
        selectedMood={selectedMood}
        setSelectedMood={(mood) => setSelectedMood(mood)}
        moodNames={moodNames}
        readOnly={readOnly && !editMode}
      />
    </div>
  );
};
