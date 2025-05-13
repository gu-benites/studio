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
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: string[] | MultiSelectOption[];
  value?: string[];
  selected?: string[];
  onChange?: (value: string[]) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mode?: 'multiple' | 'single';
  allowClear?: boolean;
}

export function MultiSelect({
  options,
  value = [],
  selected,
  onChange,
  onClear,
  placeholder = 'Select options',
  className,
  disabled = false,
  mode = 'multiple',
  allowClear = true,
}: MultiSelectProps) {
  // Use selected prop if provided, otherwise use value
  const currentValue = selected || value;
  // Normalize options to ensure consistent handling
  const normalizedOptions = options.map(option => 
    typeof option === 'string' ? { label: option, value: option } : option
  );
  const [open, setOpen] = React.useState(false);

  const handleSelect = (option: MultiSelectOption) => {
    let newValue: string[];
    if (mode === 'single') {
      // For single mode, replace the existing value
      newValue = currentValue.includes(option.value) ? [] : [option.value];
    } else {
      // For multiple mode, toggle the value
      newValue = currentValue.includes(option.value)
        ? currentValue.filter(v => v !== option.value)
        : [...currentValue, option.value];
    }
    
    onChange?.(newValue);
  };

  const handleRemove = (option: MultiSelectOption) => {
    let newValue: string[];
    if (mode === 'single') {
      // For single mode, completely clear the value
      newValue = [];
    } else {
      // For multiple mode, remove the specific value
      newValue = currentValue.filter(v => v !== option.value);
    }
    onChange?.(newValue);
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between relative"
          >
            {currentValue.length > 0 ? (
              <div className="flex flex-wrap gap-1 items-center">
                {currentValue.map((optionValue, index) => {
                  const option = normalizedOptions.find(o => o.value === optionValue);
                  return option ? (
                    <Badge
                      key={`${optionValue}-${index}`}
                      variant="secondary"
                      className="flex items-center"
                    >
                      {option.label}
                      {mode === 'single' && allowClear && (
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClear ? onClear() : handleRemove(option);
                          }}
                        />
                      )}
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command className="overflow-visible">
            <CommandInput placeholder="Search options..." disabled={disabled} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {normalizedOptions.map((option, index) => (
                  <CommandItem
                    key={`${option.value}-${index}`}
                    value={option.value}
                    disabled={disabled}
                    onSelect={() => {
                      handleSelect(option);
                      setOpen(false);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        currentValue.includes(option.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      {currentValue.includes(option.value) && '✓'}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}