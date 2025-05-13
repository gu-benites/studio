"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface CountryOption {
  label: string;
  value: string;
}

interface CountrySelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'selected'> {
  options: CountryOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  singleSelect?: boolean;
  disabled?: boolean;
}

export const CountrySelect = React.forwardRef<
  React.ElementRef<typeof Button>,
  CountrySelectProps
>((
  {
    options,
    selected = [],      // Default to empty array if undefined
    onChange,
    placeholder = "Select countries...",
    singleSelect = false,
    className,          // Destructure className
    disabled = false,   // Destructure disabled (already done, but for clarity)
    ...rest             // Destructure rest of the props
  },
  ref                 // Get the ref from forwardRef
) => {
  React.useEffect(() => {
    console.log('[CountrySelect] Props received - selected:', selected, 'options count:', options.length, 'disabled:', disabled);
  });

  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSelect = (value: string) => {
    console.log('[CountrySelect] handleSelect called with value:', value);
    console.log('[CountrySelect] current selected prop before change:', selected);
    if (disabled) {
      console.log('[CountrySelect] handleSelect: component is disabled, exiting.');
      return;
    }

    let newSelectedState: string[];
    if (singleSelect) {
      newSelectedState = selected.includes(value) ? [] : [value];
    } else {
      if (selected.includes(value)) {
        newSelectedState = selected.filter((item) => item !== value);
      } else {
        newSelectedState = [...selected, value];
      }
    }
    console.log('[CountrySelect] newSelectedState computed:', newSelectedState);
    console.log('[CountrySelect] Calling onChange prop...');
    onChange(newSelectedState);
  };

  const filteredOptions = React.useMemo(() => {
    return searchQuery
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;
  }, [searchQuery, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          ref={ref} // Apply the forwarded ref
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn( // Apply className and merge with other classes
            "w-full justify-between min-h-[38px] h-auto whitespace-normal",
            selected.length > 0 ? "text-left" : "text-muted-foreground",
            className
          )}
          disabled={disabled} // Pass disabled prop explicitly to Button
          {...rest} // Spread other props
        >
          <div className="flex flex-wrap items-center gap-1 flex-grow">
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((opt) => opt.value === value);
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                    onClick={(e) => {
                      e.stopPropagation(); 
                    }}
                  >
                    {option ? option.label : value}
                    {!singleSelect && (
                      <button
                        aria-label={`Remove ${option ? option.label : value}`}
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelect(value);
                        }}
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        disabled={disabled}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full min-w-[200px]" align="start">
        <Command>
          <CommandInput
            placeholder="Search countries..."
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value} // This value is used by cmdk and passed to onSelect
                disabled={disabled}
                // Add a direct onClick for deep diagnosis
                onClick={() => {
                  console.log(`[CountrySelect] CommandItem direct onClick! Value: ${option.value}, Label: ${option.label}`);
                }}
                onSelect={(currentValue) => { // currentValue will be option.value
                  // This log is crucial. If it doesn't appear, onSelect isn't firing.
                  console.log(`[CountrySelect] CommandItem onSelect fired! currentValue: ${currentValue}`);
                  if (disabled) {
                    console.log('[CountrySelect] CommandItem onSelect: component is disabled, exiting.');
                    return;
                  }
                  handleSelect(currentValue);
                  setSearchQuery(""); // Reset search query on select
                  setOpen(false); // Close popover on select
                }}
              >
                <div className="flex items-center">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

CountrySelect.displayName = "CountrySelect"; // For better debugging
