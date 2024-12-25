import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import React from "react";

const SearchPage = () => {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between rounded-2xl border px-4 dark:border-neutral-800">
        <Input
          placeholder="Search ideas, people, places, and more"
          className="focus-within::outline-none border-none p-0 placeholder:text-neutral-500 focus-visible:ring-0"
        />
        <div>
          <SearchIcon
            size={24}
            className="text-neutral-300 dark:text-neutral-600"
          />
        </div>
      </div>
      <div className="gap-2 grid py-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className={`h-10 w-full animate-pulse rounded-3xl bg-neutral-200 dark:bg-neutral-800 delay-[${index * 0.1}s] duration-[${
              index * 0.4
            }s]`}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
