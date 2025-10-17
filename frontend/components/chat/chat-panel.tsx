"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSocket, ChatMessage } from "@/contexts/socket-context";
import { useAuth } from "@/contexts/auth-context";
import { fetchProjectMessages } from "@/lib/api/chat";

interface ChatPanelProps {
  projectId: string;
  projectName?: string;
}

export function ChatPanel({ projectId, projectName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isConnected,
    joinProject,
    leaveProject,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageDeleted,
    onUserTyping,
    onUserStopTyping,
  } = useSocket();

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProjectMessages(projectId, { limit: 50 });
        setMessages(data.messages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [projectId]);

  // Join project room
  useEffect(() => {
    if (!isConnected || !projectId) return;

    const join = async () => {
      const success = await joinProject(projectId);
      if (!success) {
        console.error("Failed to join project chat");
      }
    };

    join();

    return () => {
      leaveProject(projectId);
    };
  }, [isConnected, projectId, joinProject, leaveProject]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      if (message.projectId === projectId) {
        setMessages((prev) => [...prev, message]);
        // Scroll to bottom
        setTimeout(() => scrollToBottom(), 100);
      }
    });

    return unsubscribe;
  }, [onNewMessage, projectId]);

  // Listen for deleted messages
  useEffect(() => {
    const unsubscribe = onMessageDeleted((messageId, msgProjectId) => {
      if (msgProjectId === projectId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    });

    return unsubscribe;
  }, [onMessageDeleted, projectId]);

  // Listen for typing indicators
  useEffect(() => {
    const unsubscribeTyping = onUserTyping((data) => {
      if (data.projectId === projectId && data.userId !== user?.id) {
        setTypingUsers((prev) => new Set(prev).add(data.userName));
      }
    });

    const unsubscribeStopTyping = onUserStopTyping((data) => {
      if (data.projectId === projectId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userName);
          return next;
        });
      }
    });

    return () => {
      unsubscribeTyping();
      unsubscribeStopTyping();
    };
  }, [onUserTyping, onUserStopTyping, projectId, user]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (!isConnected) return;

    startTyping(projectId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(projectId);
    }, 2000);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    stopTyping(projectId);

    try {
      const success = await sendMessage(projectId, newMessage.trim());
      if (success) {
        setNewMessage("");
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const formatDate = (date: Date | string) => {
    const today = new Date();
    const messageDate = typeof date === 'string' ? new Date(date) : date;

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold">{projectName || "Project Chat"}</h3>
          <p className="text-xs text-muted-foreground">
            {isConnected ? (
              <span className="text-green-500">● Connected</span>
            ) : (
              <span className="text-gray-500">○ Connecting...</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === user?.id;
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderId !== message.senderId;
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1].createdAt) !==
                  formatDate(message.createdAt);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex gap-3 ${
                      isCurrentUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {showAvatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {message.sender.avatar ||
                            message.sender.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8" />
                    )}

                    <div
                      className={`flex flex-col ${
                        isCurrentUser ? "items-end" : "items-start"
                      } max-w-[75%]`}
                    >
                      {showAvatar && (
                        <div className="mb-1 flex items-center gap-2 text-xs">
                          <span className="font-medium">
                            {message.sender.name}
                          </span>
                          <span className="text-muted-foreground">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="mt-4 text-xs text-muted-foreground">
            {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? "is" : "are"}{" "}
            typing...
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            disabled={!isConnected || isSending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
