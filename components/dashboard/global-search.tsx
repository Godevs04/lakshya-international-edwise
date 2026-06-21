"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { globalSearchAction } from "@/lib/actions/search.actions";
import { useSearchShortcutToggle } from "@/hooks/use-search-shortcut";
import type { SearchResult } from "@/types";
import { Users, Handshake, FileText } from "lucide-react";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  student: Users,
  partner: Handshake,
  application: FileText,
};

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await globalSearchAction(q);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useSearchShortcutToggle(open, onOpenChange);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  const grouped = {
    student: results.filter((r) => r.type === "student"),
    partner: results.filter((r) => r.type === "partner"),
    application: results.filter((r) => r.type === "application"),
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Search students, partners, applications..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{loading ? "Searching..." : "No results found."}</CommandEmpty>
        {(["student", "partner", "application"] as const).map((type) => {
          const items = grouped[type];
          if (items.length === 0) return null;
          const Icon = typeIcons[type];
          return (
            <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + "s"}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => handleSelect(item.href)}
                  className="rounded-xl"
                >
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6]">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
