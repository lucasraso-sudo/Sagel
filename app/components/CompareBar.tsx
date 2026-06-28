"use client";

import { useRouter } from "next/navigation";

interface CompareBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function CompareBar({ selectedIds, onClear }: CompareBarProps) {
  const router = useRouter();

  if (selectedIds.length < 2) return null;

  function handleCompare() {
    const params = selectedIds.map((id) => `id=${id}`).join("&");
    router.push(`/compare?${params}`);
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-ink text-white rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.25)] pl-6 pr-3 py-2.5 flex items-center gap-4">
      <span className="text-sm font-medium">
        {selectedIds.length} produit{selectedIds.length > 1 ? "s" : ""} sélectionné
        {selectedIds.length > 1 ? "s" : ""}
      </span>
      <button
        onClick={handleCompare}
        className="bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
      >
        Comparer →
      </button>
      <button
        onClick={onClear}
        className="text-white/60 hover:text-white text-sm transition-colors"
      >
        Effacer
      </button>
    </div>
  );
}
