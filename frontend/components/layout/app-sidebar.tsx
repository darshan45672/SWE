"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  FolderKanban,
  Inbox,
  ChevronRight,
  Clock,
  UserCircle,
  Settings,
  Loader,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { ProjectSwitcher } from "@/components/workspace/project-switcher";
import { useWorkspace } from "@/contexts/workspace-context";
import { useAuth } from "@/contexts/auth-context";
import { Issue } from "@/types";
import { cn } from "@/lib/utils";

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

const typeColors = {
  bug: "text-red-500",
  feature: "text-purple-500",
  task: "text-blue-500",
  improvement: "text-green-500",
};

export function AppSidebar() {
  const router = useRouter();
  const { issues } = useWorkspace();
  const { user } = useAuth();

  // Filter issues by category using actual issues from context
  const issueCategories = useMemo(() => {
    if (!issues) {
      return {
        allIssues: [],
        activeIssues: [],
        inProgressIssues: [],
        closedIssues: [],
      };
    }

    return {
      allIssues: issues,
      activeIssues: issues.filter(
        (issue) => issue.status === "todo" || issue.status === "in-progress"
      ),
      inProgressIssues: issues.filter((issue) => issue.status === "in-progress"),
      closedIssues: issues.filter((issue) => issue.status === "done"),
    };
  }, [issues]);

  const handleIssueClick = (issueId: string) => {
    router.push(`/issues/${issueId}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const renderIssueItem = (issue: Issue) => (
    <div
      key={issue.id}
      className="flex items-start gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent cursor-pointer group transition-colors"
      onClick={() => handleIssueClick(issue.id)}
    >
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="truncate font-medium text-sm leading-tight">{issue.title}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn("text-[10px] px-1 py-0 h-4", priorityColors[issue.priority])}
          >
            {issue.priority}
          </Badge>
          <span className={cn("text-[10px] font-medium", typeColors[issue.type])}>
            {issue.type}
          </span>
          <span className="text-[10px] text-muted-foreground">#{issue.id.slice(-6)}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            <span>{formatDate(issue.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Sidebar collapsible="icon" className="lg:collapsible-icon">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <FolderKanban className="h-5 w-5 shrink-0" />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            Workspace
          </span>
        </div>
        <div className="mt-3 group-data-[collapsible=icon]:hidden">
          <WorkspaceSwitcher className="w-full" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Projects Section */}
        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-sidebar-foreground/70">
            Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="group-data-[collapsible=icon]:hidden px-2">
              <ProjectSwitcher />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Account Section */}
        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-sidebar-foreground/70">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenu>
              <SidebarMenuItem>
                <div
                  className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push("/profile")}
                >
                  <UserCircle className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Profile</span>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div
                  className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Settings</span>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Issues Section - with ScrollArea */}
        <SidebarGroup className="flex-1 py-2">
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-sidebar-foreground/70">
            Issues
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <Accordion 
                type="multiple" 
                defaultValue={["all-issues", "active-issues"]}
                className="w-full"
              >
                {/* All Issues */}
                <AccordionItem value="all-issues" className="border-none">
                  <AccordionTrigger className="px-2 py-2 hover:bg-accent rounded-md hover:no-underline">
                    <div className="flex items-center gap-2 flex-1">
                      <Inbox className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left text-sm font-medium">All Issues</span>
                      <Badge
                        variant="secondary"
                        className="h-5 w-fit px-1.5 text-xs font-medium"
                      >
                        {issueCategories.allIssues.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-2 pt-1">
                    <div className="space-y-0.5">
                      {issueCategories.allIssues.length > 0 ? (
                        issueCategories.allIssues.map(renderIssueItem)
                      ) : (
                        <p className="text-xs text-muted-foreground px-4 py-2 text-center">
                          No issues found
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Active Issues */}
                <AccordionItem value="active-issues" className="border-none">
                  <AccordionTrigger className="px-2 py-2 hover:bg-accent rounded-md hover:no-underline">
                    <div className="flex items-center gap-2 flex-1">
                      <Circle className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left text-sm font-medium">Active Issues</span>
                      <Badge
                        variant="secondary"
                        className="h-5 w-fit px-1.5 text-xs font-medium"
                      >
                        {issueCategories.activeIssues.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-2 pt-1">
                    <div className="space-y-0.5">
                      {issueCategories.activeIssues.length > 0 ? (
                        issueCategories.activeIssues.map(renderIssueItem)
                      ) : (
                        <p className="text-xs text-muted-foreground px-4 py-2 text-center">
                          No active issues
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* In Progress Issues */}
                <AccordionItem value="in-progress-issues" className="border-none">
                  <AccordionTrigger className="px-2 py-2 hover:bg-accent rounded-md hover:no-underline">
                    <div className="flex items-center gap-2 flex-1">
                      <Loader className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left text-sm font-medium">In Progress</span>
                      <Badge
                        variant="secondary"
                        className="h-5 w-fit px-1.5 text-xs font-medium"
                      >
                        {issueCategories.inProgressIssues.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-2 pt-1">
                    <div className="space-y-0.5">
                      {issueCategories.inProgressIssues.length > 0 ? (
                        issueCategories.inProgressIssues.map(renderIssueItem)
                      ) : (
                        <p className="text-xs text-muted-foreground px-4 py-2 text-center">
                          No issues in progress
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Closed Issues */}
                <AccordionItem value="closed-issues" className="border-none">
                  <AccordionTrigger className="px-2 py-2 hover:bg-accent rounded-md hover:no-underline">
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left text-sm font-medium">Closed Issues</span>
                      <Badge
                        variant="secondary"
                        className="h-5 w-fit px-1.5 text-xs font-medium"
                      >
                        {issueCategories.closedIssues.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-2 pt-1">
                    <div className="space-y-0.5">
                      {issueCategories.closedIssues.length > 0 ? (
                        issueCategories.closedIssues.map(renderIssueItem)
                      ) : (
                        <p className="text-xs text-muted-foreground px-4 py-2 text-center">
                          No closed issues
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>
          </SidebarGroupContent>

          {/* Collapsed icon view */}
          <SidebarMenu className="group-data-[collapsible=icon]:flex hidden">
            <SidebarMenuItem>
              <div className="flex flex-col items-center gap-1 p-2">
                <Inbox className="h-4 w-4" />
                <Badge variant="secondary" className="h-5 w-fit px-1.5 text-xs">
                  {issueCategories.allIssues.length}
                </Badge>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="space-y-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Issues</span>
            <Badge variant="outline" className="h-5">
              {issueCategories.allIssues.length}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium">{issueCategories.activeIssues.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1">
              <span className="text-muted-foreground">Closed</span>
              <span className="font-medium">{issueCategories.closedIssues.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {user?.name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
