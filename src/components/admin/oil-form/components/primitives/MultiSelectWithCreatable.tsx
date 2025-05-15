import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { SelectValue, SelectTrigger, SelectContent, SelectItem } from "@radix-ui/react-select";

export interface OptionType {
  value: string;
  label: string;
}

export interface MultiSelectWithCreatableProps {
  label: string;
  options: OptionType[];
  value: string[];
  onChange: (values: string[]) => void;
  onCreateOption?: (value: string) => Promise<OptionType>;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelectWithCreatable = (
  props: MultiSelectWithCreatableProps
) => {
  const {
    label,
    options = [],
    value = [],
    onChange,
    onCreateOption,
    placeholder = "Select or create options",
    required = false,
    errorMessage,
    className = "",
    disabled = false,
  } = props;
  const [selectedValues, setSelectedValues] = useState<string[]>(value || []);
  const [inputValue, setInputValue] = useState('');
  const id = `multiselect-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      await handleCreateOption();
    }
  };

  const handleCreateClick = async () => {
    if (inputValue.trim()) {
      await handleCreateOption();
    }
  };

  const handleCreateOption = async () => {
    if (!onCreateOption) return;
    try {
      const newOption = await onCreateOption(inputValue.trim());
      setSelectedValues(prev => [...prev, newOption.value]);
      onChange([...value, newOption.value]);
      setInputValue('');
    } catch (error) {
      console.error('Error creating option:', error);
    }
  };

  const handleRemove = (valueToRemove: string) => {
    setSelectedValues(prev => prev.filter(value => value !== valueToRemove));
  };

  const handleSelect = (option: OptionType) => {
    setSelectedValues(prev => [...prev, option.value]);
  };

  useEffect(() => {
    onChange(selectedValues);
  }, [selectedValues, onChange]);

  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="space-y-2">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter new option..."
            disabled={disabled}
          />
          <Button
            type="button"
            onClick={handleCreateClick}
            disabled={disabled}
          >
            Create
          </Button>
        </form>

        {selectedValues.map((value) => {
          const option = options.find(o => o.value === value);
          if (!option) return null;
          
          return (
            <div key={value} className="flex items-center gap-2">
              {option.label}
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}

        {errorMessage && (
          <p className="text-sm text-red-500 mt-1">{errorMessage || ''}</p>
        )}
      </div>
    </div>
  );
};
