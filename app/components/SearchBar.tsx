"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  large?: boolean;
}

export function SearchBar({ initialQuery = "", placeholder, large = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-2 ${large ? "max-w-2xl mx-auto" : ""}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? "Ex : ventilateur silencieux pour chambre…"}
          className={`flex-1 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-300 text-gray-800 ${
            large ? "px-5 py-4 text-base" : "px-4 py-2.5 text-sm"
          }`}
        />
        <button
          type="submit"
          className={`bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors ${
            large ? "px-6 py-4 text-base" : "px-4 py-2.5 text-sm"
          }`}
        >
          Rechercher
        </button>
      </div>
    </form>
  );
}
