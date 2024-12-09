"use client";
import { TbInfoCircle, TbMenu } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "../../ui/dropdown-menu";
import {
  Sun,
  UserIcon,
  Bug,
  Cog,
  Computer,
  LogOut,
  Moon,
  MoonIcon,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export function NavBottom() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {isLoaded ? <UserButton /> : null}
      {isLoaded ? (
        <SignedOut>
          <button
            className="grid aspect-square h-14 w-14 place-items-center rounded-md p-0 text-lg duration-300 ease-in hover:bg-neutral-200 dark:hover:bg-neutral-950"
            onClick={() => router.push("/sign-in")}
          >
            <UserIcon size={25} />
          </button>
        </SignedOut>
      ) : null}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="grid aspect-square h-14 w-14 place-items-center rounded-md p-0 text-lg duration-300 ease-in hover:bg-neutral-200 dark:hover:bg-neutral-950">
            <TbMenu size={28} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right">
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
  );
}
