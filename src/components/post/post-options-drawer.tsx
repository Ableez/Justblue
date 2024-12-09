"use client";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "../ui/dialog";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
  IconX,
} from "@tabler/icons-react";
import {
  Drawer,
  DrawerTitle,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
  DrawerClose,
} from "../ui/drawer";

type Props = {
  postId: string;
};

const shareHandles = [
  {
    icon: (
      <div className="dark:border-spacing-950 rounded-sm border border-neutral-200 bg-black p-2 dark:border-neutral-900">
        <IconBrandX />
      </div>
    ),
    appName: "Twitter",
    url: `https://twitter.com/intent/tweet?url=`,
  },
  {
    icon: (
      <div className="dark:border-spacing-950 rounded-sm border border-neutral-200 bg-black p-2 dark:border-neutral-900">
        <IconBrandFacebook className="text-blue-600" />
      </div>
    ),
    appName: "Facebook",
    url: "https://www.facebook.com/sharer/sharer.php?u=",
  },
  {
    icon: (
      <div className="dark:border-spacing-950 rounded-sm border border-neutral-200 bg-black p-2 dark:border-neutral-900">
        <IconBrandInstagram className="text-pink-600" />
      </div>
    ),
    appName: "Instagram",
    url: "https://www.instagram.com/sharer?url=",
  },
  {
    icon: (
      <div className="dark:border-spacing-950 rounded-sm border border-neutral-200 bg-black p-2 dark:border-neutral-900">
        <IconBrandThreads />
      </div>
    ),
    appName: "Threads",
    url: "https://www.threads.net/sharer?url=",
  },
  {
    icon: (
      <div className="dark:border-spacing-950 rounded-sm border border-neutral-200 bg-black p-2 dark:border-neutral-900">
        <IconBrandLinkedin className="text-blue-600" />
      </div>
    ),
    appName: "LinkedIn",
    url: "https://www.linkedin.com/shareArticle?mini=true&url=",
  },
  {
    icon: (
      <div className="dark:border-spacing-950 rounded-sm border border-neutral-200 bg-black p-2 dark:border-neutral-900">
        <IconBrandLinkedin className="text-blue-600" />
      </div>
    ),
    appName: "Email",
    url: "https://www.linkedin.com/shareArticle?mini=true&url=",
  },
];

export const PostOptionsDrawer = ({ postId }: Props) => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button variant="ghost" size="icon">
        <Ellipsis />
      </Button>
    </DrawerTrigger>
    <DrawerContent className="mx-auto w-full max-w-md">
      <DrawerHeader>
        <DrawerTitle className="sr-only">Post Options</DrawerTitle>
      </DrawerHeader>
      <div className="flex flex-col space-y-3 p-4">
        <Button variant="ghost" className="w-full justify-start">
          Follow
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              Share to...
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share to...</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-2">
              {shareHandles.map((handle) => (
                <Button
                  key={handle.url}
                  variant="ghost"
                  className="h-16 w-full justify-start border dark:border-neutral-900"
                >
                  {handle.icon}
                  {handle.appName}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" className="w-full justify-start">
          Copy link
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-600">
          Report
        </Button>
        <DrawerClose asChild>
          <Button variant="outline" className="w-full">
            Cancel
          </Button>
        </DrawerClose>
      </div>
    </DrawerContent>
  </Drawer>
);
