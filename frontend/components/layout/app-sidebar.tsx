"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  FolderKanban,
  Inbox,
  ListTodo,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  isActive?: boolean;
}

const issueFilters: NavItem[] = [
  {
    title: "All Issues",
    icon: Inbox,
    count: 6,
    isActive: true,
  },
  {
    title: "Active Issues",
    icon: Circle,
    count: 4,
  },
  {
    title: "Closed Issues",
    icon: CheckCircle2,
    count: 1,
  },
  {
    title: "My Issues",
    icon: ListTodo,
    count: 3,
  },
];

const projects: NavItem[] = [
  {
    title: "Main Project",
    icon: FolderKanban,
    isActive: true,
  },
];

export function AppSidebar() {
  const [activeFilter, setActiveFilter] = useState("All Issues");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            Workspace
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.title}>
                  <SidebarMenuButton
                    isActive={project.isActive}
                    tooltip={project.title}
                  >
                    <project.icon className="h-4 w-4" />
                    <span>{project.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Filters Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {issueFilters.map((filter) => (
                <SidebarMenuItem key={filter.title}>
                  <SidebarMenuButton
                    isActive={activeFilter === filter.title}
                    onClick={() => setActiveFilter(filter.title)}
                    tooltip={filter.title}
                  >
                    <filter.icon className="h-4 w-4" />
                    <span className="flex-1">{filter.title}</span>
                    {filter.count !== undefined && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 w-fit px-1.5 text-xs group-data-[collapsible=icon]:hidden"
                      >
                        {filter.count}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <p>Total Issues: 6</p>
          <p>Active: 4 • Closed: 1</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
