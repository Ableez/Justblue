"use client";

import { useUser } from "@clerk/nextjs";
import {
  IconMessageCircle2,
  IconMessageCircle2Filled,
} from "@tabler/icons-react";
import { Plus, Search, UserIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GoHomeFill, GoHome } from "react-icons/go";

const tabItems = [
  { iconFilled: GoHomeFill, icon: GoHome, label: "Post" },
  { iconFilled: Search, icon: Search, label: "Search" },
  { iconFilled: Plus, icon: Plus, label: "Create" },
  {
    iconFilled: IconMessageCircle2Filled,
    icon: IconMessageCircle2,
    label: "Messages",
  },
] as const;

const MobileTabs = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>("Post");
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around gap-2 border-t bg-white p-1 dark:border-neutral-900 dark:bg-black md:hidden">
      {tabItems.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            setActiveTab(item.label);
            if (item.label === "Messages") {
              router.push("/messages");
            } else if (item.label === "Post") {
              router.push("/");
            } else if (item.label === "Search") {
              router.push("/search");
            } else if (item.label === "Create") {
              router.push("/create");
            }
          }}
          className={`grid w-full place-items-center rounded-md py-3 duration-300 ease-in hover:bg-neutral-200 dark:hover:bg-neutral-950 ${
            item.label === "Create"
              ? "bg-neutral-200 dark:bg-neutral-950/60"
              : ""
          }`}
        >
          {activeTab.toLowerCase() === item.label.toLowerCase() ? (
            <item.iconFilled size={24} color="#fff" />
          ) : (
            <item.icon size={24} color="#666" />
          )}
        </button>
      ))}
      <button
        onClick={() => router.push("/profile")}
        className={`grid w-full place-items-center rounded-md py-3 duration-300 ease-in hover:bg-neutral-200 dark:hover:bg-neutral-950`}
      >
        {user?.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt="user"
            width={25}
            height={25}
            className="rounded-full"
          />
        ) : activeTab.toLowerCase() === "messages" ? (
          <IconMessageCircle2Filled size={24} color="#fff" />
        ) : (
          <UserIcon size={24} color="#666" />
        )}
      </button>
    </div>
  );
};

export default MobileTabs;
