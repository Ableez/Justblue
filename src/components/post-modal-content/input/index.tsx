import React, { useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useMentions } from "@/hooks/use-mentions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePostStore } from "@/store/post-store";

export function MentionInput({ threadIndex }: { threadIndex: number }) {
  const {
    inputValue,
    suggestions,
    showDropdown,
    handleInput,
    insertMention,
    inputRef,
    triggerIdx,
  } = useMentions();

  const popoverTriggerRef = useRef<HTMLDivElement>(null);
  const { updatePostContent, posts } = usePostStore();

  // Update popover position based on caret position
  useEffect(() => {
    if (showDropdown && inputRef.current && popoverTriggerRef.current) {
      const textArea = inputRef.current;
      // Create a hidden div to measure text
      const mirror = document.createElement("div");
      mirror.style.position = "absolute";
      mirror.style.visibility = "hidden";
      mirror.style.whiteSpace = "pre-wrap";
      mirror.style.wordWrap = "break-word";
      // Copy textarea styles
      const styles = window.getComputedStyle(textArea);
      (
        [
          "font-family",
          "font-size",
          "line-height",
          "padding",
          "border",
          "width",
        ] as const
      ).forEach((prop) => {
        mirror.style.setProperty(prop, styles.getPropertyValue(prop));
      });

      // Get text up to cursor
      const text = inputValue.substring(0, triggerIdx);

      // Wrap @mention text with a span element
      const mentionText = text.replace(
        /(@\w+)/g,
        '<span class="mention">$1</span>',
      );
      mirror.innerHTML = mentionText;
      document.body.appendChild(mirror);

      // Calculate position
      const rect = textArea.getBoundingClientRect();
      const lineHeight = parseInt(styles.lineHeight);
      const lines = Math.floor(mirror.offsetHeight / lineHeight);

      // Position trigger
      popoverTriggerRef.current.style.position = "absolute";
      popoverTriggerRef.current.style.left = `${mirror.offsetWidth}px`;
      popoverTriggerRef.current.style.top = `${lines * lineHeight}px`;

      document.body.removeChild(mirror);
    }
  }, [showDropdown, inputValue, triggerIdx, inputRef]);

  return (
    <div className="relative mx-auto h-fit w-full">
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          updatePostContent(threadIndex, e.target.value);
          handleInput(e);

          console.log("POSTS: ", posts);
        }}
        placeholder="What's new?"
        className="row-span-6 min-h-[40px] w-full resize-none overflow-hidden rounded-none border-none bg-transparent p-0 text-sm ring-0 focus:outline-0 focus-visible:ring-0"
        style={{
          height: "auto", // Allow height to be determined by content
          overflowY: "hidden", // Hide scrollbar
        }}
      />
      <Popover
        open={showDropdown && suggestions.length > 0}
        onOpenChange={() => {
          inputRef.current?.focus();
          inputRef.current?.focus();
        }}
      >
        <PopoverTrigger asChild>
          <div ref={popoverTriggerRef} className="h-0 w-0" />
        </PopoverTrigger>
        <PopoverContent
          className={"h-fit w-[200px] bg-transparent p-0"}
          side="bottom"
          align="end"
          sideOffset={5}
          onFocus={() => {
            inputRef.current?.focus();
            // forward the focus to the input
          }}
        >
          <ScrollArea className="flex max-h-[220px] w-full flex-col overflow-y-scroll rounded-none p-2 shadow-md">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="flex w-full place-items-center justify-start gap-3 rounded-xl px-2 py-1 text-left align-middle transition-all duration-300 ease-in hover:bg-neutral-100 dark:hover:bg-neutral-900"
                onClick={() => {
                  insertMention({
                    id: suggestion.id,
                    name: `${suggestion.name.replace(/\s+/g, "").toLowerCase()}`,
                  });
                }}
                onFocus={() => {
                  inputRef.current?.focus();
                  // forward the focus to the input
                }}
              >
                <Image
                  src="https://github.com/shadcn.png"
                  width={30}
                  height={30}
                  alt="avatar"
                  className="rounded-full"
                />
                <div>
                  <h4 className="text-sm font-medium">{suggestion.name}</h4>
                  <h4 className="text-xs text-neutral-500">
                    @{suggestion.name.toLowerCase().replace(/\s+/g, "")}
                  </h4>
                </div>
              </button>
            ))}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
