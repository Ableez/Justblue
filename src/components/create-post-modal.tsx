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
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "./ui/drawer";

type Props = {
  open: boolean;
  closeModal: () => void;
  action: "create" | "comment";
  postId?: string;
};

const Content = ({ params }: { params: Props }) => {
  const { open, closeModal, action, postId } = params;

  return (
    <div className={"h-full"}>
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
      <ScrollArea className="md:max-h-[80dvh] max-h-[100dvh] overflow-y-auto md:pb-0 pb-20">
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
    </div>
  );
};

const PostModal = ({ open, closeModal, action, postId }: Props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={closeModal}>
        <DrawerContent className="h-[100dvh]">
          <Content params={{ open, closeModal, action, postId }} />
        </DrawerContent>
      </Drawer>
    );
  } else {
    return (
      <Dialog open={open} onOpenChange={closeModal}>
        <DialogContent>
          <Content params={{ open, closeModal, action, postId }} />
        </DialogContent>
      </Dialog>
    );
  }
};

export default PostModal;
