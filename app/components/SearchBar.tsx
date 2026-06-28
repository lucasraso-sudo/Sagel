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
    <form
      onSubmit={handleSubmit}
      className={`relative w-full ${large ? "max-w-xl mx-auto" : ""}`}
    >
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? "Robot, ventilateur, climatiseur…"}
        className={`w-full bg-white border-2 border-line rounded-full text-ink placeholder:text-muted outline-none transition-[border-color,box-shadow] focus:border-brand focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)] ${
          large ? "pl-12 pr-32 py-4 text-base" : "pl-11 pr-28 py-3 text-sm"
        }`}
      />
      <button
        type="submit"
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand hover:bg-brand-light text-white font-semibold rounded-full transition-colors ${
          large ? "px-5 py-2.5 text-sm" : "px-4 py-2 text-[0.82rem]"
        }`}
      >
        Rechercher
      </button>
    </form>
  );
}
