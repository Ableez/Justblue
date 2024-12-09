"use client";

import { useEffect, useState } from "react";
import {
  Asterisk,
  MoonIcon,
  Sun,
  Moon,
  Computer,
  Cog,
  LogOut,
  Bug,
} from "lucide-react";
import React from "react";
import { TbInfoCircle, TbMenu } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSubTrigger,
  DropdownMenuSub,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useTheme } from "next-themes";
import Link from "next/link";

const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(20);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader);

    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`sticky left-0 right-0 top-0 z-50 h-16 bg-white/80 backdrop-blur-sm transition-transform duration-300 dark:bg-black/80 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className={"relative h-full w-full"}>
        <Link href={"/"} className="absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center p-2">
          <Asterisk size={54} />
        </Link>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="absolute md:hidden right-4 top-1/2 grid aspect-square h-12 -translate-y-1/2 place-items-center justify-center rounded-md duration-300 hover:bg-neutral-200 dark:text-neutral-600 dark:hover:bg-neutral-950 dark:hover:text-white">
              <TbMenu size={28} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="mr-4">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex cursor-pointer gap-4 p-3 px-4">
                {theme === "light" ? <Moon /> : <Sun />}
                Appearance
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={`flex cursor-pointer gap-4 p-3 px-4 ${theme === "dark" ? "bg-neutral-200 dark:bg-neutral-700" : ""}`}
                  >
                    <MoonIcon size={20} />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={`flex cursor-pointer gap-4 p-3 px-4 ${theme === "light" ? "bg-neutral-200 dark:bg-neutral-700" : ""}`}
                  >
                    <Sun size={20} />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={`flex cursor-pointer gap-4 p-3 px-4 ${theme === "system" ? "bg-neutral-200 dark:bg-neutral-700" : ""}`}
                  >
                    <Computer size={20} />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem className="flex cursor-pointer gap-4 p-3 px-4">
              <TbInfoCircle />
              Insights
            </DropdownMenuItem>
            <DropdownMenuItem className="flex cursor-pointer gap-4 p-3 px-4">
              <Cog />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex cursor-pointer gap-4 p-3 px-4">
              <Bug />
              Report a bug
            </DropdownMenuItem>
            <DropdownMenuItem className="flex cursor-pointer gap-4 p-3 px-4 text-red-600 hover:text-red-400">
              <LogOut />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
