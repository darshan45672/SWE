"use client";

import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useWorkspace } from "@/contexts/workspace-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  urgent: "bg-red-500/10 text-red-500",
};

const typeIcons: Record<string, string> = {
  bug: "🐛",
  feature: "✨",
  task: "📋",
  improvement: "🚀",
};

export function NotificationDropdown() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
  } = useWorkspace();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const handleNotificationClick = (notificationId: string, link?: string) => {
    markNotificationAsRead(notificationId);
    if (link) {
      router.push(link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between px-2 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={markAllNotificationsAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No notifications
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative rounded-md p-3 hover:bg-accent cursor-pointer transition-colors",
                    !notification.read && "bg-accent/50"
                  )}
                  onClick={() =>
                    handleNotificationClick(notification.id, notification.link)
                  }
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                  )}

                  <div className="flex gap-3 pl-3">
                    {/* Issue Type Icon */}
                    {notification.issue && (
                      <div className="shrink-0 text-lg mt-0.5">
                        {typeIcons[notification.issue.type]}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Issue metadata */}
                      {notification.issue && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-5 px-1.5",
                              priorityColors[notification.issue.priority]
                            )}
                          >
                            {notification.issue.priority}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {notification.issue.id}
                          </span>
                        </div>
                      )}

                      {/* Time and mark as read */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
