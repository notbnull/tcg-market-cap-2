"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/app/ui/components/input";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mb-6">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search Pokémon cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
