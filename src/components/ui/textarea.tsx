
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  renderText?: (text: string) => React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, renderText, ...props }, ref) => {
    // Use a wrapper div when renderText is provided
    if (renderText && props.value !== undefined) {
      return (
        <div className={cn(
          "relative flex min-h-[80px] w-full rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}>
          <div 
            className="absolute inset-0 overflow-auto px-3 py-2 text-sm"
            style={{ pointerEvents: 'none', zIndex: 1 }}
          >
            {renderText(props.value.toString())}
          </div>
          <textarea
            className="relative z-0 w-full h-full resize-none bg-transparent p-3 text-sm focus:outline-none"
            ref={ref}
            {...props}
          />
        </div>
      )
    }
    
    // Default rendering when no renderText is provided
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
