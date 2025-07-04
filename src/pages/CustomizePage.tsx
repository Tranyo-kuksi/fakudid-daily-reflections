import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, CheckCircle, Trash2, Plus, LayoutGrid, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUserPreferences } from "@/hooks/useUserPreferences";

// Define theme options with gradients for visual representation
const lightThemes = [
  { id: "lavender", name: "Lavender", gradient: "linear-gradient(135deg, #bc7bed 0%, #9b65c7 100%)" },
  { id: "mint", name: "Mint", gradient: "linear-gradient(135deg, #c2fcdf 0%, #92dbb7 100%)" },
  { id: "peach", name: "Peach", gradient: "linear-gradient(135deg, #fcd4b1 0%, #f5b086 100%)" },
  { id: "sky", name: "Sky Blue", gradient: "linear-gradient(135deg, #a2f1fa 0%, #79d8e6 100%)" },
  { id: "bubblegum", name: "Bubblegum", gradient: "linear-gradient(135deg, #FFDEE2 0%, #ffb8c2 100%)" },
  { id: "golden-hour", name: "Golden Hour", gradient: "linear-gradient(135deg, #FFBF00 0%, #FDE1D3 100%)" }
];

const darkThemes = [
  { id: "midnight", name: "Midnight", color: "#2c3e50" },
  { id: "forest", name: "Forest", color: "#2E4045" },
  { id: "plum", name: "Plum", color: "#4A3B4B" },
  { id: "ocean", name: "Ocean", color: "#1F3A5F" },
  { id: "cosmos", name: "Cosmos", color: "#1A1F2C" },
  { id: "molten", name: "Molten", color: "#320A0A" }
];

// Template section colors
const templateColors = [
  { id: 'workout', name: 'Workout', color: 'from-orange-500 to-red-500' },
  { id: 'mindfulness', name: 'Mindfulness', color: 'from-purple-500 to-violet-500' },
  { id: 'reading', name: 'Reading', color: 'from-blue-500 to-indigo-500' },
  { id: 'hydration', name: 'Hydration', color: 'from-cyan-400 to-blue-500' },
  { id: 'sleep', name: 'Sleep', color: 'from-blue-600 to-indigo-600' },
  { id: 'social', name: 'Social', color: 'from-pink-500 to-rose-500' },
  { id: 'screenTime', name: 'Screen Time', color: 'from-green-500 to-emerald-500' },
  { id: 'creative', name: 'Creative', color: 'from-yellow-500 to-amber-500' },
  { id: 'productivity', name: 'Productivity', color: 'from-orange-500 to-amber-500' },
  { id: 'selfCare', name: 'Self-Care', color: 'from-rose-400 to-pink-500' }
];

interface TemplateField {
  id: string;
  name: string;
  type: 'tags' | 'counter';
  tags?: string[];
  counterMax?: number;
  multiSelect?: boolean;
}

interface TemplateSection {
  id: string;
  name: string;
  fields: TemplateField[];
  color: string;
  enabled: boolean;
}

interface MoodPreferences {
  moodNames: {
    dead: string;
    sad: string;
    meh: string;
    good: string;
    awesome: string;
  };
}

export default function CustomizePage() {
  const { theme, lightTheme, setLightTheme, darkTheme, setDarkTheme } = useTheme();
  const { isSubscribed, openCheckout } = useSubscription();
  
  // Mood customization - use cloud-synced preferences
  const [moodPreferences, setMoodPreferences] = useUserPreferences<MoodPreferences>('mood-preferences', {
    moodNames: {
      dead: "Dead Inside",
      sad: "Shity",
      meh: "Meh",
      good: "Pretty Good",
      awesome: "Fucking AWESOME"
    }
  });
  
  // Template customization
  const [templateSections, setTemplateSections] = useLocalStorage<TemplateSection[]>(
    'fakudid-template-sections',
    [
      {
        id: 'workout',
        name: 'Workout',
        color: 'workout',
        enabled: true,
        fields: [
          {
            id: 'workout-equipment',
            name: 'Equipment',
            type: 'tags',
            tags: ['weights', 'bodyweight', 'machines', 'bands'],
            multiSelect: true
          },
          {
            id: 'workout-duration',
            name: 'Duration',
            type: 'tags',
            tags: ['30min', '45min', '1hr', '3sets'],
            multiSelect: true
          },
          {
            id: 'workout-exercises',
            name: 'Exercises',
            type: 'tags',
            tags: ['cardio', 'strength', 'flexibility', 'hiit'],
            multiSelect: true
          }
        ]
      },
      {
        id: 'mindfulness',
        name: 'Prayer/Mindfulness',
        color: 'mindfulness',
        enabled: true,
        fields: [
          {
            id: 'mindfulness-practice',
            name: 'Did you pray/meditate?',
            type: 'tags',
            tags: ['yes', 'no'],
            multiSelect: false
          },
          {
            id: 'mindfulness-duration',
            name: 'Duration',
            type: 'tags',
            tags: ['5min', '20min', '30min'],
            multiSelect: false
          },
          {
            id: 'mindfulness-mood',
            name: 'Mood after',
            type: 'tags',
            tags: ['calm', 'refreshed', 'distracted'],
            multiSelect: true
          }
        ]
      },
      {
        id: 'reading',
        name: 'Reading/Learning',
        color: 'reading',
        enabled: true,
        fields: [
          {
            id: 'reading-did',
            name: 'Did you read?',
            type: 'tags',
            tags: ['yes', 'no'],
            multiSelect: false
          },
          {
            id: 'reading-format',
            name: 'Format',
            type: 'tags',
            tags: ['book', 'article', 'podcast'],
            multiSelect: true
          },
          {
            id: 'reading-time',
            name: 'Time spent',
            type: 'tags',
            tags: ['10min', '30min', '1hr'],
            multiSelect: false
          }
        ]
      },
      {
        id: 'hydration',
        name: 'Hydration',
        color: 'hydration',
        enabled: true,
        fields: [
          {
            id: 'hydration-amount',
            name: 'Amount',
            type: 'tags',
            tags: ['1cup', '2cups', '3cups', '4cups', '5cups'],
            multiSelect: false
          }
        ]
      }
    ]
  );
  
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");
  const [editingFieldName, setEditingFieldName] = useState("");
  const [editingTagName, setEditingTagName] = useState("");

  const saveMoodNames = () => {
    setMoodPreferences(moodPreferences);
    toast.success("Mood names saved successfully");
  };
  
  const handleMoodNameChange = (mood: string, name: string) => {
    setMoodPreferences(prev => ({
      ...prev,
      moodNames: {
        ...prev.moodNames,
        [mood]: name
      }
    }));
  };

  const handleThemeSelect = (isLight: boolean, themeId: string) => {
    if (isLight) {
      setLightTheme(themeId);
      toast.success(`Light theme changed to ${themeId}`);
    } else {
      setDarkTheme(themeId);
      toast.success(`Dark theme changed to ${themeId}`);
    }
  };

  const addNewSection = () => {
    const newId = `section-${Date.now()}`;
    const newSection: TemplateSection = {
      id: newId,
      name: "New Section",
      color: templateColors[0].id,
      enabled: true,
      fields: []
    };
    
    setTemplateSections([...templateSections, newSection]);
    setActiveSectionId(newId);
    setEditingSectionName("New Section");
    toast.success("New section added");
  };

  const updateSectionName = (sectionId: string) => {
    if (!editingSectionName.trim()) {
      toast.error("Section name cannot be empty");
      return;
    }
    
    setTemplateSections(templateSections.map(section => 
      section.id === sectionId
        ? { ...section, name: editingSectionName }
        : section
    ));
    
    toast.success("Section name updated");
  };

  const deleteSection = (sectionId: string) => {
    setTemplateSections(templateSections.filter(section => section.id !== sectionId));
    if (activeSectionId === sectionId) {
      setActiveSectionId(null);
    }
    toast.success("Section deleted");
  };

  const toggleSectionEnabled = (sectionId: string) => {
    setTemplateSections(templateSections.map(section => 
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const updateSectionColor = (sectionId: string, colorId: string) => {
    setTemplateSections(templateSections.map(section => 
      section.id === sectionId
        ? { ...section, color: colorId }
        : section
    ));
  };

  const addFieldToSection = (sectionId: string) => {
    const section = templateSections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newFieldId = `${sectionId}-field-${Date.now()}`;
    const newField: TemplateField = {
      id: newFieldId,
      name: "New Field",
      type: 'tags',
      tags: [],
      multiSelect: true
    };
    
    setTemplateSections(templateSections.map(s => 
      s.id === sectionId
        ? { ...s, fields: [...s.fields, newField] }
        : s
    ));
    
    setActiveFieldId(newFieldId);
    setEditingFieldName("New Field");
    toast.success("New field added");
  };

  const updateFieldName = (sectionId: string, fieldId: string) => {
    if (!editingFieldName.trim()) {
      toast.error("Field name cannot be empty");
      return;
    }
    
    setTemplateSections(templateSections.map(section => 
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId
                ? { ...field, name: editingFieldName }
                : field
            )
          }
        : section
    ));
    
    toast.success("Field name updated");
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    setTemplateSections(templateSections.map(section => 
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.filter(field => field.id !== fieldId)
          }
        : section
    ));
    
    if (activeFieldId === fieldId) {
      setActiveFieldId(null);
    }
    
    toast.success("Field deleted");
  };

  const addTagToField = (sectionId: string, fieldId: string) => {
    if (!editingTagName.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }
    
    setTemplateSections(templateSections.map(section => 
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId
                ? { 
                    ...field, 
                    tags: [...(field.tags || []), editingTagName]
                  }
                : field
            )
          }
        : section
    ));
    
    setEditingTagName("");
    toast.success("Tag added");
  };

  const deleteTag = (sectionId: string, fieldId: string, tagIndex: number) => {
    setTemplateSections(templateSections.map(section => 
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId && field.tags
                ? { 
                    ...field, 
                    tags: field.tags.filter((_, i) => i !== tagIndex)
                  }
                : field
            )
          }
        : section
    ));
    
    toast.success("Tag deleted");
  };

  const toggleMultiSelect = (sectionId: string, fieldId: string) => {
    setTemplateSections(templateSections.map(section => 
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId
                ? { ...field, multiSelect: !field.multiSelect }
                : field
            )
          }
        : section
    ));
  };
  
  // Determine if we're currently in light or dark mode
  const currentMode = theme === "system" 
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme;
  
  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="themes">
            <AccordionTrigger className="py-4 px-5 bg-card rounded-lg hover:no-underline hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                  <span className="text-white font-medium">T</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Customize Themes</h3>
                  <p className="text-sm text-muted-foreground">Change the look and feel of your journal</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-4">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Light Mode Themes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {lightThemes.map(themeOption => (
                        <div 
                          key={themeOption.id}
                          className={`relative cursor-pointer rounded-lg p-2 transition-all hover:opacity-90 ${
                            lightTheme === themeOption.id ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:scale-105'
                          }`}
                          onClick={() => handleThemeSelect(true, themeOption.id)}
                        >
                          <div 
                            className="h-24 rounded-md w-full mb-2 shadow-inner" 
                            style={{ 
                              background: themeOption.gradient,
                              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                            }}
                          />
                          <div className="text-center font-medium">{themeOption.name}</div>
                          {lightTheme === themeOption.id && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          {currentMode === 'light' && lightTheme === themeOption.id && (
                            <div className="absolute bottom-8 left-0 right-0 text-center text-xs font-medium text-primary">
                              Active
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dark Mode Themes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {darkThemes.map(themeOption => (
                        <div 
                          key={themeOption.id}
                          className={`relative cursor-pointer rounded-lg p-2 transition-all hover:opacity-90 ${
                            darkTheme === themeOption.id ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:scale-105'
                          }`}
                          onClick={() => handleThemeSelect(false, themeOption.id)}
                        >
                          <div 
                            className="h-24 rounded-md w-full mb-2 shadow-inner" 
                            style={{ 
                              backgroundColor: themeOption.color,
                              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
                            }}
                          />
                          <div className="text-center font-medium">{themeOption.name}</div>
                          {darkTheme === themeOption.id && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          {currentMode === 'dark' && darkTheme === themeOption.id && (
                            <div className="absolute bottom-8 left-0 right-0 text-center text-xs font-medium text-primary">
                              Active
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="moods" className="mt-3">
            <AccordionTrigger className="py-4 px-5 bg-card rounded-lg hover:no-underline hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-center">
                  <span className="text-white font-medium">M</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Customize Moods</h3>
                  <p className="text-sm text-muted-foreground">Personalize how you express your feelings</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Skull className="h-8 w-8 text-mood-dead" />
                        <Input 
                          value={moodPreferences.moodNames.dead}
                          onChange={(e) => handleMoodNameChange('dead', e.target.value)}
                          maxLength={20}
                          placeholder="Dead Inside"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <FrownIcon className="h-8 w-8 text-mood-sad" />
                        <Input 
                          value={moodPreferences.moodNames.sad}
                          onChange={(e) => handleMoodNameChange('sad', e.target.value)}
                          maxLength={20}
                          placeholder="Shity"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MehIcon className="h-8 w-8 text-mood-meh" />
                        <Input 
                          value={moodPreferences.moodNames.meh}
                          onChange={(e) => handleMoodNameChange('meh', e.target.value)}
                          maxLength={20}
                          placeholder="Meh"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <SmileIcon className="h-8 w-8 text-mood-good" />
                        <Input 
                          value={moodPreferences.moodNames.good}
                          onChange={(e) => handleMoodNameChange('good', e.target.value)}
                          maxLength={20}
                          placeholder="Pretty Good"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <PartyPopper className="h-8 w-8 text-mood-awesome" />
                        <Input 
                          value={moodPreferences.moodNames.awesome}
                          onChange={(e) => handleMoodNameChange('awesome', e.target.value)}
                          maxLength={20}
                          placeholder="Fucking AWESOME"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      className="mt-4 w-full md:w-auto bg-fakudid-purple hover:bg-fakudid-darkPurple"
                      onClick={saveMoodNames}
                    >
                      Save Mood Names
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="templates" className="mt-3">
            <AccordionTrigger className="py-4 px-5 bg-card rounded-lg hover:no-underline hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                  <span className="text-white font-medium">T</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Customize Templates</h3>
                  <p className="text-sm text-muted-foreground">Create and modify journal template sections</p>
                  {!isSubscribed && (
                    <Badge variant="outline" className="ml-2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-4">
              {isSubscribed ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5" />
                        Customize Templates
                      </CardTitle>
                      <CardDescription>Create and modify journal template sections</CardDescription>
                    </div>
                    <Button onClick={addNewSection} size="sm" className="gap-1">
                      <Plus size={16} /> Add Section
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Left sidebar - Section list */}
                      <div className="border rounded-md p-4 h-auto">
                        <h3 className="font-medium text-sm mb-3">Template Sections</h3>
                        <div className="space-y-2">
                          {templateSections.map(section => (
                            <div 
                              key={section.id}
                              className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                                activeSectionId === section.id 
                                  ? 'bg-primary/10 border border-primary/30'
                                  : 'hover:bg-accent'
                              }`}
                              onClick={() => {
                                setActiveSectionId(section.id);
                                setActiveFieldId(null);
                                setEditingSectionName(section.name);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Toggle
                                  pressed={section.enabled}
                                  onPressedChange={() => toggleSectionEnabled(section.id)}
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className={`w-2 h-2 rounded-full ${section.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                </Toggle>
                                <span className={section.enabled ? 'font-medium' : 'text-muted-foreground'}>{section.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSection(section.id);
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Middle - Section details */}
                      <div className="border rounded-md p-4 h-auto">
                        {activeSectionId ? (
                          <div className="space-y-4">
                            <h3 className="font-medium mb-3">Section Settings</h3>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Section Name</label>
                              <div className="flex gap-2">
                                <Input 
                                  value={editingSectionName}
                                  onChange={(e) => setEditingSectionName(e.target.value)}
                                  placeholder="Section name"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => updateSectionName(activeSectionId)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Color</label>
                              <div className="flex gap-2 flex-wrap">
                                {templateColors.map(color => (
                                  <div
                                    key={color.id}
                                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.color} cursor-pointer ${
                                      templateSections.find(s => s.id === activeSectionId)?.color === color.id
                                        ? 'ring-2 ring-primary'
                                        : ''
                                    }`}
                                    onClick={() => updateSectionColor(activeSectionId, color.id)}
                                    title={color.name}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Fields</h4>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => addFieldToSection(activeSectionId)}
                                >
                                  <Plus size={14} className="mr-1" /> Add Field
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                {templateSections.find(s => s.id === activeSectionId)?.fields.map(field => (
                                  <div
                                    key={field.id}
                                    className={`p-2 rounded-md border cursor-pointer ${
                                      activeFieldId === field.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:bg-accent'
                                    }`}
                                    onClick={() => {
                                      setActiveFieldId(field.id);
                                      setEditingFieldName(field.name);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{field.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteField(activeSectionId, field.id);
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {field.tags?.map((tag, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            Select a section to edit
                          </div>
                        )}
                      </div>
                      
                      {/* Right - Field details */}
                      <div className="border rounded-md p-4 h-auto">
                        {activeFieldId && activeSectionId ? (
                          <div className="space-y-4">
                            <h3 className="font-medium mb-3">Field Settings</h3>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Field Name</label>
                              <div className="flex gap-2">
                                <Input 
                                  value={editingFieldName}
                                  onChange={(e) => setEditingFieldName(e.target.value)}
                                  placeholder="Field name"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => updateFieldName(activeSectionId, activeFieldId)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Selection Type</label>
                                <ToggleGroup type="single" value={
                                  templateSections.find(s => s.id === activeSectionId)
                                    ?.fields.find(f => f.id === activeFieldId)?.multiSelect ? "multi" : "single"
                                }>
                                  <ToggleGroupItem value="single" onClick={() => toggleMultiSelect(activeSectionId, activeFieldId)}>
                                    Single
                                  </ToggleGroupItem>
                                  <ToggleGroupItem value="multi" onClick={() => toggleMultiSelect(activeSectionId, activeFieldId)}>
                                    Multiple
                                  </ToggleGroupItem>
                                </ToggleGroup>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Tags</h4>
                              </div>
                              
                              <div className="space-y-2 mb-3">
                                <div className="flex gap-2">
                                  <Input 
                                    value={editingTagName}
                                    onChange={(e) => setEditingTagName(e.target.value)}
                                    placeholder="New tag name"
                                  />
                                  <Button 
                                    size="sm"
                                    onClick={() => addTagToField(activeSectionId, activeFieldId)}
                                    disabled={!editingTagName.trim()}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {templateSections.find(s => s.id === activeSectionId)
                                  ?.fields.find(f => f.id === activeFieldId)
                                  ?.tags?.map((tag, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 border rounded-md"
                                  >
                                    <span>{tag}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => deleteTag(activeSectionId, activeFieldId, index)}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            {activeSectionId 
                              ? "Select a field to edit"
                              : "Select a section first"
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="py-8 text-center space-y-5">
                      <Sparkles className="mx-auto h-12 w-12 text-amber-500" />
                      <div>
                        <h2 className="text-2xl font-semibold mb-2">Premium Feature</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Template customization is available for Premium subscribers. Upgrade to create custom journal templates.
                        </p>
                      </div>
                      <Button onClick={openCheckout} className="bg-amber-500 hover:bg-amber-600">
                        Upgrade to Premium
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
