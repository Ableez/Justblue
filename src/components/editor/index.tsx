"use client";

import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, type EditorState } from "lexical";

import { MATCHERS } from "../../lib/auto-link-matcher";
import { HashtagPlugin } from "./plugins/hashtag-plugin";
import { useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { editorConfig } from "@/lib/editor-config";

interface EditorProps {
  onChange?: (content: string) => void;
  editorState: string;
  placeholder?: string;
}

export default function LexicalEditor({
  onChange,
  editorState,
  placeholder,
}: EditorProps) {
  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot();
        const content = root.getTextContent();
        onChange?.(content);
      });
    },
    [onChange],
  );

  const onError = (error: Error) => {
    console.error(error);
  };

  return (
    <LexicalComposer initialConfig={{ ...editorConfig, onError, editorState }}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="text-sm focus:outline-none" />
        }
        placeholder={<Placeholder placeholder={placeholder} />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <LinkPlugin />
      <HashtagPlugin />
      <AutoLinkPlugin matchers={MATCHERS} />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <OnChangePlugin onChange={handleChange} />
    </LexicalComposer>
  );
}

function Placeholder({ placeholder }: { placeholder?: string }) {
  return (
    <div className="absolute left-[75px] top-[40px] text-[14px] text-neutral-500">
      {placeholder ?? "What&apos;s new?"}
    </div>
  );
}
