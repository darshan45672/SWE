"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Issue } from "@/types";
import { cn } from "@/lib/utils";

interface IssueSearchProps {
  issues: Issue[];
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

const typeColors = {
  bug: "bg-red-500/10 text-red-600",
  feature: "bg-purple-500/10 text-purple-600",
  task: "bg-blue-500/10 text-blue-600",
  improvement: "bg-green-500/10 text-green-600",
};

export function IssueSearch({ issues }: IssueSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter issues based on search query - Context7 pattern
  const filteredIssues = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    return issues.filter((issue) => {
      // Search in title
      if (issue.title.toLowerCase().includes(query)) {
        return true;
      }

      // Search in description
      if (issue.description?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in tags
      if (issue.tags?.some(tag => tag.toLowerCase().includes(query))) {
        return true;
      }

      // Search by status
      if (issue.status.toLowerCase().includes(query)) {
        return true;
      }

      // Search by priority
      if (issue.priority.toLowerCase().includes(query)) {
        return true;
      }

      // Search by type
      if (issue.type.toLowerCase().includes(query)) {
        return true;
      }

      // Search by assignee name
      if (issue.assignee?.name.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    }).slice(0, 10); // Limit to 10 results for performance
  }, [issues, searchQuery]);

  // Open popover when user starts typing
  useEffect(() => {
    if (searchQuery.trim()) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchQuery]);

  const handleSelectIssue = (issueId: string) => {
    setOpen(false);
    setSearchQuery("");
    router.push(`/issues/${issueId}`);
  };

  const handleClear = () => {
    setSearchQuery("");
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9"
              onFocus={() => {
                if (searchQuery.trim()) {
                  setOpen(true);
                }
              }}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {filteredIssues.length === 0 && searchQuery.trim() && (
                <CommandEmpty>No issues found.</CommandEmpty>
              )}
              {filteredIssues.length > 0 && (
                <CommandGroup heading={`${filteredIssues.length} issue${filteredIssues.length !== 1 ? 's' : ''} found`}>
                  {filteredIssues.map((issue) => (
                    <CommandItem
                      key={issue.id}
                      value={issue.id}
                      onSelect={() => handleSelectIssue(issue.id)}
                      className="flex flex-col items-start gap-2 py-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", typeColors[issue.type])}
                        >
                          {issue.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", priorityColors[issue.priority])}
                        >
                          {issue.priority}
                        </Badge>
                      </div>
                      <div className="w-full">
                        <p className="font-medium text-sm line-clamp-1">
                          {issue.title}
                        </p>
                        {issue.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {issue.description}
                          </p>
                        )}
                      </div>
                      {issue.tags && issue.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 w-full">
                          {issue.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {issue.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{issue.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
