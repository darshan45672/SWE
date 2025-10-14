"use client";

import { useState, ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { cn } from "@/lib/utils";
import { WorkspaceProvider } from "@/contexts/workspace-context";

interface LayoutClientProps {
  children: ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <WorkspaceProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden">
          {/* Left Sidebar */}
          <AppSidebar />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top Navigation */}
            <TopNavigation
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              isChatOpen={isChatOpen}
            />

            {/* Content Grid: Kanban Board + Chat */}
            <div className="flex flex-1 overflow-hidden">
              {/* Kanban Board (Main Content - Wider) */}
              <div className="flex-1 overflow-hidden">{children}</div>

              {/* Chat Panel (Right Column) - Collapsible */}
              <div
                className={cn(
                  "relative border-l bg-background transition-all duration-300 ease-in-out",
                  isChatOpen ? "w-80 xl:w-96" : "w-0"
                )}
              >
                {isChatOpen && <ChatPanel />}
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
