import { AutoLinkNode, LinkNode } from "@lexical/link";
import { HashtagNode } from "@lexical/hashtag";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { MentionNode } from "@/components/editor/nodex/mention-node";
import { EditorConfig } from "lexical";

export const editorConfig = {
  namespace: "MyEditor",
  onError(error: Error) {
    throw error;
  },
  nodes: [
    MentionNode,
    AutoLinkNode,
    LinkNode,
    HashtagNode,
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
  ],
  theme: {
    paragraph: "text-sm",
    heading: "text-2xl font-bold",
    list: "list-decimal",
    hashtag: "text-blue-500 bg-blue-500 px-1 py-0.5 rounded-md",
    link: "text-blue-500",
    quote: "text-gray-500",
    code: "text-gray-500 font-mono",
    codeBlock: "text-gray-500 font-mono",
  },
} as EditorConfig;
