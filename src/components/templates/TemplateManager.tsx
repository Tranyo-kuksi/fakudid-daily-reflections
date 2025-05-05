
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TemplateSection } from './TemplateSection';
import { LayoutTemplate } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export interface TemplateState {
  sections: Record<string, string[]>;
}

interface TemplateManagerProps {
  initialValues?: TemplateState;
  readOnly?: boolean;
  onEdit?: () => void;
  entryId?: string;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ 
  initialValues,
  readOnly = false,
  onEdit,
  entryId
}) => {
  const [openSections, setOpenSections] = useLocalStorage<string[]>('fakudid-open-sections', []);
  const [templateValues, setTemplateValues] = useState<TemplateState>(
    initialValues || { sections: {} }
  );
  const [templateSections] = useLocalStorage<any[]>('fakudid-template-sections', defaultTemplateSections);
  
  // Update templateValues if initialValues changes (when editing a past entry)
  useEffect(() => {
    if (initialValues) {
      setTemplateValues(initialValues);
    }
  }, [initialValues]);
  
  // Effect to save template values whenever they change
  useEffect(() => {
    if (!readOnly) {
      saveTemplateValues();
    }
  }, [templateValues, readOnly]);
  
  const toggleSection = (sectionId: string) => {
    if (openSections.includes(sectionId)) {
      setOpenSections(openSections.filter(id => id !== sectionId));
    } else {
      setOpenSections([...openSections, sectionId]);
    }
  };

  const handleValueChange = (sectionId: string, fieldId: string, value: string) => {
    if (readOnly) return;
    
    const currentFieldValues = templateValues.sections[fieldId] || [];
    const updatedFieldValues = currentFieldValues.includes(value)
      ? currentFieldValues.filter(v => v !== value)
      : [...currentFieldValues, value];

    setTemplateValues({
      ...templateValues,
      sections: {
        ...templateValues.sections,
        [fieldId]: updatedFieldValues
      }
    });
  };

  const saveTemplateValues = () => {
    // Save the template values to use later when saving the journal entry
    localStorage.setItem('current-template-values', JSON.stringify(templateValues));
    
    // Dispatch an event to notify JournalPage component
    window.dispatchEvent(new CustomEvent('template-updated', { 
      detail: { templateValues } 
    }));
  };

  // Filter out disabled template sections
  const enabledTemplateSections = templateSections.filter(section => 
    section.enabled !== false
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          {readOnly ? "Template Data" : "Journal Templates"}
        </h2>
      </div>
      
      <div className="space-y-3">
        {enabledTemplateSections.map(section => (
          <TemplateSection
            key={section.id}
            section={section}
            isOpen={openSections.includes(section.id)}
            onToggle={() => toggleSection(section.id)}
            selectedValues={templateValues.sections}
            onValueChange={(fieldId, value) => handleValueChange(section.id, fieldId, value)}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
};

// Helper function to generate text from template values
function generateTemplateText(values: TemplateState, sections: any[]): string {
  let text = '';

  sections.forEach(section => {
    let sectionHasContent = false;
    let sectionText = `### ${section.name}\n`;

    section.fields.forEach(field => {
      const fieldValues = values.sections[field.id] || [];
      if (fieldValues.length > 0) {
        sectionHasContent = true;
        sectionText += `- ${field.name}: ${fieldValues.map(v => `#${v}`).join(' ')}\n`;
      }
    });

    if (sectionHasContent) {
      text += sectionText + '\n';
    }
  });

  return text;
}

// Default template sections
const defaultTemplateSections = [
  {
    id: 'workout',
    name: 'Workout',
    color: 'workout',
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
];
