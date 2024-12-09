import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from "lexical";

import { TextNode } from "lexical";

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
  },
  SerializedTextNode
>;

export class MentionNode extends TextNode {
  __mention: string;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__text, node.__key);
  }

  constructor(mentionName: string, text?: string, key?: NodeKey) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cssText = "color: #1a73e8;";
    return dom;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      type: "mention",
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mentionName);
    node.setTextContent(serializedNode.text);
    return node;
  }

  isTextEntity(): boolean {
    return true;
  }
}

export function $createMentionNode(mentionName: string): MentionNode {
  const mentionNode = new MentionNode(mentionName);
  mentionNode.setMode("segmented").toggleDirectionless();
  return mentionNode;
}

export function $isMentionNode(
  node: LexicalNode | null | undefined,
): node is MentionNode {
  return node instanceof MentionNode;
}
