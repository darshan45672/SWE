"use client";

import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceProvider } from "@/contexts/workspace-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WorkspaceProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full overflow-hidden">
              {/* Left Sidebar */}
              <AppSidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Top Navigation */}
              <TopNavigation onToggleChat={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />

              {/* Content Grid: Kanban Board + Chat */}
              <div className="flex flex-1 overflow-hidden">
                {/* Kanban Board (Main Content - Wider) */}
                <div className="flex-1 overflow-hidden">
                  {children}
                </div>

                {/* Chat Panel (Right Column) - Collapsible */}
                <div
                  className={cn(
                    "relative border-l bg-background transition-all duration-300 ease-in-out",
                    isChatOpen ? "w-80 xl:w-96" : "w-0"
                  )}
                >
                  {isChatOpen && <ChatPanel />}
                  
                  {/* Chat Toggle Button (Visible when closed) */}
                  {!isChatOpen && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -left-10 top-4"
                      onClick={() => setIsChatOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">Open chat</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarProvider>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
