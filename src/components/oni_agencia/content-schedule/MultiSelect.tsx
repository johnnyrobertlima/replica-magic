
import React, { useEffect, useState, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  className
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value || []);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Sync internal state with external value
  useEffect(() => {
    setSelectedOptions(value || []);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleOption = (optionValue: string) => {
    let newSelectedOptions: string[];
    
    if (optionValue === "all") {
      // Toggle all options selection
      if (selectedOptions.length === options.length) {
        newSelectedOptions = [];
      } else {
        newSelectedOptions = options.map(option => option.value);
      }
    } else {
      // Toggle individual option
      if (selectedOptions.includes(optionValue)) {
        newSelectedOptions = selectedOptions.filter(v => v !== optionValue);
      } else {
        newSelectedOptions = [...selectedOptions, optionValue];
      }
    }
    
    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };

  const getSelectedDisplay = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }
    
    if (selectedOptions.length === options.length) {
      return "All selected";
    }
    
    return `${selectedOptions.length} selected`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm",
          className
        )}
      >
        <span className="truncate">{getSelectedDisplay()}</span>
        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
      </button>
      
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
          <div className="p-1">
            <div
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => handleToggleOption("all")}
            >
              <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                selectedOptions.length === options.length ? "bg-primary border-primary" : "border-gray-300"
              }`}>
                {selectedOptions.length === options.length && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-gray-800">All options</span>
            </div>
            
            {options.map(option => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleToggleOption(option.value)}
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                  selectedOptions.includes(option.value) ? "bg-primary border-primary" : "border-gray-300"
                }`}>
                  {selectedOptions.includes(option.value) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-gray-800">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
