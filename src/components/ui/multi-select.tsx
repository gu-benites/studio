// src/components/ui/multi-select.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList, // Added import
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, X, ChevronsUpDown } from 'lucide-react'; // Added Check and ChevronsUpDown

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[]; // Expect normalized options
  selected: string[]; // Expect an array of selected string values (IDs)
  onChange: (selectedValues: string[]) => void; // Expect a function that takes an array of string values
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mode?: 'multiple' | 'single'; // 'single' is effectively a regular select
  allowClear?: boolean; // Relevant for single mode
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
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleValueChange = (valueToToggle: string) => {
    if (disabled) return;

    let newSelectedValues: string[];
    if (mode === 'single') {
      newSelectedValues = selected.includes(valueToToggle) ? [] : [valueToToggle];
    } else {
      newSelectedValues = selected.includes(valueToToggle)
        ? selected.filter(v => v !== valueToToggle)
        : [...selected, valueToToggle];
    }
    onChange(newSelectedValues);
  };
  
  const handleRemoveBadge = (valueToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent popover from opening/closing
    if (disabled) return;
    onChange(selected.filter(v => v !== valueToRemove));
  };
  
  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    onChange([]);
  }

  const filteredOptions = React.useMemo(() => {
    return searchQuery
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;
  }, [searchQuery, options]);
  
  const selectedOptionsToDisplay = selected
    .map(value => options.find(opt => opt.value === value))
    .filter(Boolean) as MultiSelectOption[];


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[2.5rem] h-auto whitespace-normal group", // h-10 equivalent
            selected.length > 0 ? "text-left" : "text-muted-foreground",
            className
          )}
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
                      onMouseDown={(e) => e.preventDefault()} // Prevents Popover from closing on click
                      onClick={(e) => handleRemoveBadge(option.value, e)}
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:pointer-events-none"
                      disabled={disabled}
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
           {selected.length > 0 && allowClear && mode === 'multiple' && (
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
          <CommandInput
            placeholder="Search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            disabled={disabled}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value} // This value is used by cmdk for filtering/selection
                  disabled={disabled}
                  onSelect={(currentValue) => { // currentValue is option.value
                    if (disabled) return;
                    handleValueChange(currentValue);
                    if(mode === 'single') setOpen(false); // Close on select for single mode
                    setSearchQuery(""); // Reset search query on select
                  }}
                  className="cursor-pointer"
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
