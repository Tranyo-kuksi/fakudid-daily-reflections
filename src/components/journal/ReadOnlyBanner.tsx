
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Edit } from "lucide-react";

interface ReadOnlyBannerProps {
  editMode: boolean;
  toggleEditMode: () => void;
  searchQuery: string | null;
}

export const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({
  editMode,
  toggleEditMode,
  searchQuery,
}) => {
  return (
    <div className={`${editMode ? "bg-amber-100 dark:bg-amber-950" : "bg-yellow-100 dark:bg-yellow-900"} p-3 mb-4 rounded-md flex justify-between items-center`}>
      <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
        {editMode ? (
          "You are editing a past entry. Click Save when finished."
        ) : (
          <>
            This is a past entry. You are viewing it in read-only mode.
            {searchQuery && 
              <span className="ml-2">
                Showing results for: <strong>{searchQuery}</strong>
              </span>
            }
          </>
        )}
      </p>
      <Button
        variant={editMode ? "destructive" : "outline"}
        size="sm"
        onClick={toggleEditMode}
        className="ml-2"
      >
        {editMode ? (
          <>
            <X size={16} className="mr-1" /> Cancel Edit
          </>
        ) : (
          <>
            <Edit size={16} className="mr-1" /> Edit Entry
          </>
        )}
      </Button>
    </div>
  );
};
