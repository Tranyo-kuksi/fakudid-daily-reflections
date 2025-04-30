
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { PromptButton } from "@/components/journal/PromptButton";

interface JournalEditorProps {
  journalEntry: string;
  setJournalEntry: (entry: string) => void;
  readOnly: boolean;
  editMode: boolean;
  highlightedContent: React.ReactNode | null;
  handleSave: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  journalEntry,
  setJournalEntry,
  readOnly,
  editMode,
  highlightedContent,
  handleSave,
}) => {
  return (
    <div className="relative">
      {readOnly && !editMode && highlightedContent ? (
        <div className="min-h-[calc(100vh-240px)] w-full resize-none text-lg p-4 border rounded-md whitespace-pre-wrap">
          {highlightedContent}
        </div>
      ) : (
        <Textarea 
          placeholder="Write about your day..."
          className="min-h-[calc(100vh-240px)] w-full resize-none text-lg p-4 focus:border-fakudid-purple border-none"
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          readOnly={readOnly && !editMode}
        />
      )}

      {(!readOnly || editMode) && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-2">
          {editMode && (
            <Button 
              className="rounded-full shadow-lg w-12 h-12 p-0"
              onClick={handleSave}
            >
              <Save size={20} />
            </Button>
          )}
          <PromptButton
            journalEntry={journalEntry}
            onPromptGenerated={setJournalEntry}
            readOnly={readOnly && !editMode}
          />
        </div>
      )}
    </div>
  );
};
