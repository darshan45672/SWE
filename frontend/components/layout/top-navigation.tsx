"use client";

import { Search, User, MessageSquare, LogOut, FolderKanban, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { InviteWorkspaceDialog } from "@/components/workspace/invite-workspace-dialog";
import { IssueSearch } from "@/components/kanban/issue-search";
import { useAuth } from "@/contexts/auth-context";
import { useWorkspace } from "@/contexts/workspace-context";

interface TopNavigationProps {
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export function TopNavigation({ onToggleChat, isChatOpen }: TopNavigationProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { issues } = useWorkspace();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 lg:px-6">
        {/* Left Section: Sidebar Toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger />
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">PM</span>
            </div>
            <span className="hidden text-lg sm:inline-block">ProjectManager</span>
          </div>
        </div>

        {/* Center Section: Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4">
          <IssueSearch issues={issues} />
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Icon on Mobile - TODO: Add mobile search modal */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Invite Workspace */}
          {isAuthenticated && <InviteWorkspaceDialog />}

          {/* Chat Toggle - Now visible on mobile */}
          <Button 
            variant={isChatOpen ? "default" : "ghost"} 
            size="icon"
            onClick={onToggleChat}
            title={isChatOpen ? "Close chat" : "Open chat"}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">{isChatOpen ? "Close chat" : "Open chat"}</span>
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.name ? getUserInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/")}>
                  <FolderKanban className="mr-2 h-4 w-4" />
                  <span>Board</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={handleSignIn}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
