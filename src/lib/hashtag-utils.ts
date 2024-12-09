import { $createHashtagNode } from "@lexical/hashtag";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  type LexicalCommand,
  TextNode,
  createCommand,
} from "lexical";

export const INSERT_HASHTAG_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_HASHTAG_COMMAND",
);

export function insertHashtag(hashtag: string) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return;
  }

  const nodes = selection.extract();

  if (nodes.length === 1) {
    const node = nodes[0];
    if (node instanceof TextNode) {
      const textContent = node.getTextContent();
      const currentOffset = selection.anchor.offset;

      // Insert the hashtag at the current cursor position
      node.spliceText(currentOffset, 0, `#${hashtag} `, true);

      // Create a HashtagNode
      const hashtagNode = $createHashtagNode();
      hashtagNode.setTextContent(`#${hashtag}`);

      // Replace the text with the HashtagNode
      node.splitText(currentOffset);
      const [, rightPart] = node.splitText(currentOffset + hashtag.length + 1);
      node.replace(hashtagNode);

      // Move the selection after the inserted hashtag
      rightPart?.select(0, 0);
    }
  } else {
    // If there's no existing text, just insert the hashtag
    const hashtagNode = $createHashtagNode();
    hashtagNode.setTextContent(`#${hashtag}`);
    selection.insertNodes([hashtagNode, $createTextNode(" ")]);
  }
}
