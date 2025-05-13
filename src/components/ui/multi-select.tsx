// src/components/ui/multi-select.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput, // Temporarily re-added for full cmdk behavior test, can be removed if not the cause
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, X, ChevronsUpDown } from 'lucide-react';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mode?: 'multiple' | 'single';
  allowClear?: boolean;
  popoverContentClassName?: string;
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder = 'Select options',
  className,
  disabled = false,
  mode = 'multiple',
  allowClear = true,
  popoverContentClassName
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(""); // Re-added for testing

  React.useEffect(() => {
    // console.log(`[MultiSelect] Render/Update. Disabled: ${disabled}, Selected:`, selected);
  }, [disabled, selected]);

  const handleValueChange = (valueToToggle: string) => {
    // console.log(`[MultiSelect] handleValueChange called. Value: ${valueToToggle}, Current Selected:`, selected, `Component Disabled: ${disabled}`);
    if (disabled) {
      // console.log('[MultiSelect] Attempted to change value while disabled.');
      return;
    }

    let newSelectedValues: string[];
    if (mode === 'single') {
      newSelectedValues = selected.includes(valueToToggle) ? [] : [valueToToggle];
    } else {
      newSelectedValues = selected.includes(valueToToggle)
        ? selected.filter(v => v !== valueToToggle)
        : [...selected, valueToToggle];
    }
    // console.log('[MultiSelect] Calling onChange with new values:', newSelectedValues);
    onChange(newSelectedValues);
  };
  
  const handleRemoveBadge = (valueToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    onChange(selected.filter(v => v !== valueToToggle));
  };
  
  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    onChange([]);
  }

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, options]);
  
  const selectedOptionsToDisplay = selected
    .map(value => options.find(opt => opt.value === value))
    .filter(Boolean) as MultiSelectOption[];


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[2.5rem] h-auto whitespace-normal group",
            selected.length > 0 ? "text-left" : "text-muted-foreground",
            className
          )}
          disabled={disabled} // Main trigger button respects disabled prop
        >
          <div className="flex flex-wrap items-center gap-1 flex-grow overflow-hidden">
            {selectedOptionsToDisplay.length > 0 ? (
              selectedOptionsToDisplay.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="rounded-sm px-1.5 py-0.5 font-normal text-xs"
                >
                  {option.label}
                  {(mode === 'multiple' || (mode === 'single' && allowClear)) && (
                    <button
                      aria-label={`Remove ${option.label}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => handleRemoveBadge(option.value, e)}
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:pointer-events-none"
                      disabled={disabled} // Badge remove button also respects disabled
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-sm">{placeholder}</span>
            )}
          </div>
           {selected.length > 0 && allowClear && mode === 'multiple' && !disabled && (
            <X
              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 text-muted-foreground cursor-pointer group-hover:opacity-100"
              onClick={handleClearAll}
              aria-label="Clear all selections"
            />
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("p-0 w-[--radix-popover-trigger-width] min-w-[200px]", popoverContentClassName)} 
        align="start"
      >
        <Command>
           <CommandInput // Re-added CommandInput for testing if it affects item selectability
            placeholder="Search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            // disabled={disabled} // CommandInput itself doesn't need to be disabled if PopoverTrigger is
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value} // This value is used by cmdk for its internal logic and passed to onSelect
                  onSelect={(currentValue) => { // currentValue is option.value
                    // console.log(`[MultiSelect] CommandItem onSelect fired! Value: ${currentValue}, Component Disabled: ${disabled}`);
                    // The main `disabled` prop for MultiSelect is checked in `handleValueChange`.
                    // No need to check `disabled` directly here on CommandItem, as an open Popover implies the trigger wasn't disabled.
                    handleValueChange(currentValue);
                    if(mode === 'single') setOpen(false);
                     setSearchQuery(""); // Reset search query after selection
                  }}
                  className="cursor-pointer"
                  // Do NOT put disabled={disabled} here directly, as it makes items unclickable
                  // even if the popover is open. The overall component disabled state is handled by the PopoverTrigger.
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
