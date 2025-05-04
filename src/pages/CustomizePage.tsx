import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface MoodNames {
  dead: string;
  sad: string;
  meh: string;
  good: string;
  awesome: string;
}

export default function CustomizePage() {
  const [moodNames, setMoodNames] = useState<MoodNames>({
    dead: "Dead Inside",
    sad: "Shity",
    meh: "Meh",
    good: "Pretty Good",
    awesome: "Fucking AWESOME"
  });

  useEffect(() => {
    // Load mood names from local storage on component mount
    const storedMoodNames = localStorage.getItem("fakudid-mood-names");
    if (storedMoodNames) {
      setMoodNames(JSON.parse(storedMoodNames));
    }
  }, []);

  const handleInputChange = (mood: keyof MoodNames, event: React.ChangeEvent<HTMLInputElement>) => {
    setMoodNames({ ...moodNames, [mood]: event.target.value });
  };

  const saveMoodNames = () => {
    // Save mood names to local storage
    localStorage.setItem("fakudid-mood-names", JSON.stringify(moodNames));
    toast.success("Mood names saved successfully!");
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Customize</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mood Customization</CardTitle>
            <CardDescription>Customize the names of your moods</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="dead">Dead Inside</Label>
                <Input
                  id="dead"
                  placeholder="Dead Inside"
                  value={moodNames.dead}
                  onChange={(e) => handleInputChange("dead", e)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="sad">Shity</Label>
                <Input
                  id="sad"
                  placeholder="Shity"
                  value={moodNames.sad}
                  onChange={(e) => handleInputChange("sad", e)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="meh">Meh</Label>
                <Input
                  id="meh"
                  placeholder="Meh"
                  value={moodNames.meh}
                  onChange={(e) => handleInputChange("meh", e)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="good">Pretty Good</Label>
                <Input
                  id="good"
                  placeholder="Pretty Good"
                  value={moodNames.good}
                  onChange={(e) => handleInputChange("good", e)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-1">
              <div className="grid gap-1.5">
                <Label htmlFor="awesome">Fucking AWESOME</Label>
                <Input
                  id="awesome"
                  placeholder="Fucking AWESOME"
                  value={moodNames.awesome}
                  onChange={(e) => handleInputChange("awesome", e)}
                />
              </div>
            </div>

            <Button 
              className="mt-4 w-full md:w-auto" 
              variant="themeDark"
              onClick={saveMoodNames}
            >
              Save Mood Names
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
