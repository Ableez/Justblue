"use client";

import {
  IconMessageCircle2,
  IconMessageCircle2Filled,
} from "@tabler/icons-react";
import { Asterisk, Plus, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { GoHomeFill, GoHome } from "react-icons/go";
import { NavBottom } from "./nav-bottom";
import { useTheme } from "next-themes";
import CreateModal from "@/components/create-post-modal";
import ModalContext from "@/lib/context/modal";

const sidebarItems = [
  { path: "/", iconFilled: GoHomeFill, icon: GoHome, label: "Post" },
  { path: "/explore", iconFilled: Search, icon: Search, label: "Explore" },
  { path: "/create", iconFilled: Plus, icon: Plus, label: "Create" },
  {
    path: "/messages",
    iconFilled: IconMessageCircle2Filled,
    icon: IconMessageCircle2,
    label: "Messages",
  },
] as const;

const getButtonClass = (itemPath: string, currentPath: string) => {
  if (itemPath === currentPath && itemPath === "create")
    return "bg-neutral-300/60 dark:bg-neutral-600/50";
  if (itemPath === currentPath && itemPath !== "create")
    return "bg-neutral-300/60 dark:bg-black";
  if (itemPath === "/create") return "bg-neutral-200/60 dark:bg-neutral-900/50";
  return "";
};

const getIconColor = (itemPath: string, currentPath: string, theme: string) => {
  if (itemPath === currentPath && theme === "dark") return "#fff";
  if (itemPath === "/create" && theme === "dark") return "#666";
  if (itemPath === currentPath && theme === "light") return "#222";
  if (itemPath === "/create" && theme === "light") return "#fff";
  return "#444";
};

const DesktopSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = pathname === "/" ? "/" : `/${pathname?.split("/")[1]}`;
  const theme = useTheme();

  const { open, setOpen } = useContext(ModalContext);

  return (
    <div className="fixed hidden h-[100dvh] flex-col justify-between p-4 py-4 dark:border-neutral-900 md:flex">
      <Asterisk
        size={44}
        className="cursor-pointer duration-300 ease-in hover:scale-[1.1]"
      />
      <div className="flex flex-col justify-between gap-2">
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            className={`grid aspect-square h-14 w-full place-items-center justify-center rounded-md px-3 py-2 align-middle duration-300 ease-in hover:bg-neutral-200 dark:hover:bg-neutral-950 ${getButtonClass(
              item.path,
              currentPath,
            )}`}
            onClick={() => {
              if (item.path === "/create") {
                setOpen(true);
              } else {
                router.push(item.path);
              }
            }}
          >
            <div className="relative h-7 w-7">
              <item.iconFilled
                className={`absolute transition-all duration-300 ${
                  item.path === currentPath
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0"
                }`}
                size={28}
                color={getIconColor(
                  item.path,
                  currentPath,
                  theme.theme ?? "dark",
                )}
              />
              <item.icon
                className={`absolute transition-all duration-300 ${
                  item.path === currentPath
                    ? "scale-0 opacity-0"
                    : "scale-100 opacity-100"
                }`}
                size={28}
                color={getIconColor(
                  item.path,
                  currentPath,
                  theme.theme ?? "dark",
                )}
              />
            </div>
          </button>
        ))}
      </div>
      <NavBottom />
    </div>
  );
};

export default DesktopSidebar;
