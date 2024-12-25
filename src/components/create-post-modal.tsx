import { MoreHorizontal } from "lucide-react";
import CreatePost from "./post-modal-content/create-post";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import CommentPost from "./post-modal-content/comment-post";

type Props = {
  open: boolean;
  closeModal: () => void;
  action: "create" | "comment";
  postId?: string;
};

const PostModal = ({ open, closeModal, action, postId }: Props) => {
  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="bg-black p-2 text-white sm:max-w-lg w-full">
        <div className="relative flex place-items-center items-center justify-between border-b border-neutral-800">
          <Button variant="link" onClick={closeModal}>
            Cancel
          </Button>
          <DialogTitle className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 place-items-center text-xl font-bold">
            {action === "create" ? "New Post" : "Comment"}
          </DialogTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={"icon"} variant="ghost">
                <MoreHorizontal size={19} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as paid sponsorship</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ScrollArea className="max-h-[80dvh] overflow-y-auto">
          {(() => {
            switch (action) {
              case "create":
                return <CreatePost action="create" closeModal={closeModal} />;
              case "comment":
                return postId ? (
                  <CommentPost closeModal={closeModal} postId={postId} />
                ) : null;
              default:
                return null;
            }
          })()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;
