"use client";

import { Search } from "lucide-react";
import { Input } from "@/app/ui/components/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("query")?.toString() || ""
  );

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set("query", searchTerm);
      } else {
        params.delete("query");
      }
      replace(`${pathname}?${params.toString()}`);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, searchParams, pathname, replace]);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 w-full bg-gray-800/40 border-gray-700 text-white placeholder-gray-400 focus-visible:ring-gray-500"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
