import { useState, useCallback, useRef } from "react";

const users = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Charlie Brown" },
  { id: 4, name: "David Lee" },
  { id: 5, name: "Emma Watson" },
  { id: 6, name: "Emma Watson" },
  { id: 7, name: "Emma Watson" },
  { id: 8, name: "Emma Watson" },
  { id: 9, name: "Emma Watson" },
  { id: 10, name: "Emma Watson" },
  { id:11, name: "Emma Watson" },
  { id: 12, name: "Emma Watson" },
  { id: 13, name: "Emma Watson" },
  { id: 14, name: "Emma Watson" },
  { id: 15, name: "Emma Watson" },
  { id: 16, name: "Emma Watson" },
  { id: 17, name: "Emma Watson" },
];

const hashtags = [
  { id: 1, name: "react" },
  { id: 2, name: "javascript" },
  { id: 3, name: "webdev" },
  { id: 4, name: "coding" },
  { id: 5, name: "frontend" },
];

interface Suggestion {
  id: number;
  name: string;
}

export function useMentions() {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [triggerIdx, setTriggerIdx] = useState(-1);
  const [triggerChar, setTriggerChar] = useState<"@" | "#" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const updateSuggestions = useCallback((char: "@" | "#", term: string) => {
    const sourceList = char === "@" ? users : hashtags;
    const filteredSuggestions = sourceList.filter((item) =>
      item.name.toLowerCase().includes(term.toLowerCase()),
    );
    setSuggestions(filteredSuggestions);
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const cursorPosition = e.target.selectionStart;
      setInputValue(value);

      // Find the last trigger character before cursor
      const textBeforeCursor = value.slice(0, cursorPosition);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");
      const lastHashIndex = textBeforeCursor.lastIndexOf("#");
      const lastIndex = Math.max(lastAtIndex, lastHashIndex);

      if (lastIndex >= 0 && (lastIndex === 0 || value[lastIndex - 1] === " ")) {
        const searchText = textBeforeCursor.slice(lastIndex + 1);
        const char = value[lastIndex] as "@" | "#";

        // Only show dropdown if we're still typing after the trigger
        if (cursorPosition > lastIndex) {
          setTriggerChar(char);
          setTriggerIdx(lastIndex);
          setSearchTerm(searchText);
          updateSuggestions(char, searchText);
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      } else {
        setShowDropdown(false);
      }
    },
    [updateSuggestions],
  );

  const insertMention = useCallback(
    (suggestion: Suggestion) => {
      if (inputRef.current && triggerIdx !== -1) {
        const beforeMention = inputValue.slice(0, triggerIdx);
        const afterMention = inputValue.slice(inputRef.current.selectionStart);
        const mentionText = `${triggerChar}${suggestion.name} `;
        const newValue = beforeMention + mentionText + afterMention;

        setInputValue(newValue);
        setShowDropdown(false);
        setTriggerIdx(-1);
        setTriggerChar(null);
        setSearchTerm("");

        // Set cursor position after the inserted mention
        const newCursorPosition = triggerIdx + mentionText.length;
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition,
            );
          }
        });
      }
    },
    [inputValue, triggerIdx, triggerChar],
  );

  return {
    inputValue,
    suggestions,
    showDropdown,
    handleInput,
    insertMention,
    inputRef,
    triggerIdx,
    searchTerm,
  };
}
