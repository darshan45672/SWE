"use client";

import { useState, ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { cn } from "@/lib/utils";
import { WorkspaceProvider, useWorkspace } from "@/contexts/workspace-context";
import { SocketProvider } from "@/contexts/socket-context";
import { AuthGuard } from "@/components/auth/auth-guard";

interface LayoutClientProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentProject } = useWorkspace();

  return (
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
          <div className="flex flex-1 overflow-hidden relative">
            {/* Kanban Board (Main Content - Wider) */}
            <div className="flex-1 overflow-hidden">{children}</div>

            {/* Chat Panel (Right Column) - Sidebar on desktop, overlay on mobile */}
            {/* Desktop: Shows as side panel */}
            <div
              className={cn(
                "relative border-l bg-background transition-all duration-300 ease-in-out hidden md:block",
                isChatOpen ? "w-80 xl:w-96" : "w-0"
              )}
            >
              {isChatOpen && currentProject && (
                <ChatPanel
                  projectId={currentProject.id}
                  projectName={currentProject.name}
                />
              )}
              {isChatOpen && !currentProject && (
                <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                  <p>Select a project to start chatting</p>
                </div>
              )}
            </div>

            {/* Mobile: Shows as overlay */}
            {isChatOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => setIsChatOpen(false)}
                />

                {/* Chat Panel */}
                <div className="absolute right-0 top-0 h-full w-[85vw] max-w-sm border-l bg-background shadow-lg animate-in slide-in-from-right">
                  {currentProject ? (
                    <ChatPanel
                      projectId={currentProject.id}
                      projectName={currentProject.name}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                      <p>Select a project to start chatting</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function LayoutClient({ children }: LayoutClientProps) {
  return (
    <AuthGuard>
      <WorkspaceProvider>
        <SocketProvider>
          <LayoutContent>{children}</LayoutContent>
        </SocketProvider>
      </WorkspaceProvider>
    </AuthGuard>
  );
}
