
import React from "react";
import { useJournalEntry } from "@/hooks/useJournalEntry";
import { useJournalAttachments } from "@/hooks/useJournalAttachments";
import { useTemplateHandling } from "@/hooks/useTemplateHandling";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { JournalHeader } from "@/components/journal/JournalHeader";
import { JournalToolbar } from "@/components/journal/JournalToolbar";
import { AttachmentSection } from "@/components/journal/AttachmentSection";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { ReadOnlyBanner } from "@/components/journal/ReadOnlyBanner";
import { autosaveEntry } from "@/services/journalService";

export default function JournalPage() {
  const {
    journalTitle,
    setJournalTitle,
    journalEntry,
    setJournalEntry,
    selectedMood,
    setSelectedMood,
    entryId,
    readOnly,
    editMode,
    highlightedContent,
    highlightedTitle,
    currentEntry,
    setCurrentEntry,
    templateData,
    setTemplateData,
    moodNames,
    searchQuery,
    toggleEditMode,
    handleSave,
  } = useJournalEntry();

  const {
    fileInputRef,
    audioInputRef,
    handleImageAttachment,
    handleMusicAttachment,
    handleFileSelected,
    handleDeleteAttachment
  } = useJournalAttachments(
    entryId,
    currentEntry,
    setCurrentEntry,
    readOnly,
    editMode,
    journalEntry,
    selectedMood,
    autosaveEntry
  );

  const {
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    viewTemplateData,
    openTemplateDialog
  } = useTemplateHandling(
    journalEntry,
    setJournalEntry,
    setTemplateData,
    templateData,
    readOnly,
    editMode,
    toggleEditMode
  );

  return (
    <div className="w-full h-full relative">
      {readOnly && (
        <ReadOnlyBanner 
          editMode={editMode}
          toggleEditMode={toggleEditMode}
          searchQuery={searchQuery}
        />
      )}
      
      <div className="mb-4 space-y-4">
        <JournalHeader 
          journalTitle={journalTitle}
          setJournalTitle={setJournalTitle}
          selectedMood={selectedMood}
          setSelectedMood={setSelectedMood}
          readOnly={readOnly}
          editMode={editMode}
          highlightedTitle={highlightedTitle}
          moodNames={moodNames}
        />

        <JournalToolbar 
          onTemplateOpen={openTemplateDialog}
          onImageClick={handleImageAttachment}
          onMusicClick={handleMusicAttachment}
          fileInputRef={fileInputRef}
          audioInputRef={audioInputRef}
          onFileSelected={handleFileSelected}
          readOnly={readOnly}
          editMode={editMode}
          templateData={templateData}
          viewTemplateData={viewTemplateData}
        />

        {currentEntry?.attachments && currentEntry.attachments.length > 0 && (
          <AttachmentSection 
            attachments={currentEntry.attachments}
            onDelete={handleDeleteAttachment}
            readOnly={readOnly}
            editMode={editMode}
          />
        )}
      </div>

      <JournalEditor 
        journalEntry={journalEntry}
        setJournalEntry={setJournalEntry}
        readOnly={readOnly}
        editMode={editMode}
        highlightedContent={highlightedContent}
        handleSave={handleSave}
      />

      <TemplateDialog 
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        initialValues={templateData}
        readOnly={readOnly && !editMode}
        onEdit={toggleEditMode}
        entryId={entryId || undefined}
      />
    </div>
  );
}
