import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SingleSelectDropdownProps {
  label: string;
  id: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
  className?: string;
  disabled?: boolean;
}

export const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({
  label,
  id,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  errorMessage,
  className = "",
  disabled = false,
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value || ''}
        onValueChange={(newValue) => {
          onChange(newValue || null);
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};
