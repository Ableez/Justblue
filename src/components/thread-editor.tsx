import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "./editor/plugins/hashtag-plugin";

type ThreadEditorProps = {
  placeholder: string;
  content: string;
  onChange: (content: string) => void;
};

const initialConfig = {
  namespace: "ThreadEditor",
  theme: {
    paragraph: "mb-1",
    hashtag: "text-blue-500",
    mention: "text-blue-500",
  },
  onError: (error: Error) => console.error(error),
};

const ThreadEditor = ({ placeholder, onChange }: ThreadEditorProps) => {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[40px] h-[12px] p-0 resize-none outline-none" />
          }
        
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HashtagPlugin />
      </div>
    </LexicalComposer>
  );
};

export default ThreadEditor;
