
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Loading entry with search query:", searchQuery);
    // Implement search functionality here
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Journal History</h1>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          placeholder="Search entries by text, title or date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="themeDark" className="px-3">
          <Search className="h-5 w-5" />
        </Button>
      </form>

      <div className="grid gap-6">
        <p>Your journal entries will appear here.</p>
      </div>
    </div>
  );
}
