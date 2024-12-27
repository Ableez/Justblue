import React from "react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

interface Suggestion {
  id: number;
  name: string;
}

interface DropdownProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
}

export function Dropdown({ suggestions, onSelect }: DropdownProps) {
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandGroup>
        {suggestions.map((suggestion) => (
          <CommandItem
            key={suggestion.id}
            onSelect={() => onSelect(suggestion)}
            className="cursor-pointer"
          >
            {suggestion.name}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
}
