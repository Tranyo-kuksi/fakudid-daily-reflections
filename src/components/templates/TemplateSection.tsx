
import React from 'react';
import { Tag } from '../shared/Tag';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface TemplateField {
  id: string;
  name: string;
  type: 'tags' | 'counter';
  tags?: string[];
  counterMax?: number;
  multiSelect?: boolean;
}

export interface TemplateSection {
  id: string;
  name: string;
  fields: TemplateField[];
  color: string;
}

interface TemplateSectionProps {
  section: TemplateSection;
  isOpen: boolean;
  onToggle: () => void;
  selectedValues: Record<string, string[]>;
  onValueChange: (fieldId: string, value: string) => void;
  onCounterChange?: (fieldId: string, count: number) => void;
}

export const TemplateSection: React.FC<TemplateSectionProps> = ({
  section,
  isOpen,
  onToggle,
  selectedValues,
  onValueChange,
  onCounterChange
}) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden mb-3">
      <button
        className="w-full p-3 flex justify-between items-center text-left focus:outline-none"
        onClick={onToggle}
      >
        <span className="font-medium">{section.name}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-border bg-card/50">
          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.id}>
                <h3 className="text-sm text-muted-foreground mb-2">{field.name}</h3>
                
                {field.type === 'tags' && field.tags && (
                  <div className="flex flex-wrap gap-2">
                    {field.tags.map((tag) => (
                      <Tag
                        key={tag}
                        label={tag}
                        isSelected={selectedValues[field.id]?.includes(tag) || false}
                        onClick={() => onValueChange(field.id, tag)}
                        category={section.color}
                      />
                    ))}
                  </div>
                )}
                
                {/* Counter implementation will be added later if needed */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
