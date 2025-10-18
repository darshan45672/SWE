"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const [isAITyping, setIsAITyping] = useState(false);
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
    onAITyping,
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

  // Listen for AI typing indicator
  useEffect(() => {
    const unsubscribe = onAITyping((data) => {
      if (data.projectId === projectId) {
        setIsAITyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    });

    return unsubscribe;
  }, [onAITyping, projectId]);

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
    <div className="flex h-full flex-col bg-background overflow-hidden">
      {/* Chat Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b px-4 py-3">
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

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
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
                  const isCurrentUser = message.senderId === user?.id && !message.isAIMessage;
                  const isAIMessage = message.isAIMessage === true;
                  const showAvatar =
                    index === 0 ||
                    messages[index - 1].senderId !== message.senderId ||
                    messages[index - 1].isAIMessage !== message.isAIMessage;
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
                      <Avatar className={`h-8 w-8 ${isAIMessage ? "bg-gradient-to-br from-purple-500 to-pink-500" : ""}`}>
                        <AvatarFallback className="text-xs">
                          {isAIMessage ? (
                            <Bot className="h-4 w-4 text-white" />
                          ) : (
                            message.sender.avatar ||
                            message.sender.name.slice(0, 2).toUpperCase()
                          )}
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
                            {isAIMessage ? "AI Assistant" : message.sender.name}
                          </span>
                          {isAIMessage && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              <Sparkles className="h-2.5 w-2.5 mr-1" />
                              AI
                            </Badge>
                          )}
                          <span className="text-muted-foreground">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isAIMessage
                            ? "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800"
                            : isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {isAIMessage ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Style headings
                                h1: ({ ...props }) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-base font-semibold mt-2 mb-1" {...props} />,
                                h3: ({ ...props }) => <h3 className="text-sm font-semibold mt-1 mb-1" {...props} />,
                                // Style lists
                                ul: ({ ...props }) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                                ol: ({ ...props }) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                                li: ({ ...props }) => <li className="text-sm" {...props} />,
                                // Style code blocks
                                code: ({ inline, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
                                  if (inline) {
                                    return (
                                      <code
                                        className="bg-purple-200 dark:bg-purple-800/50 px-1.5 py-0.5 rounded text-xs font-mono"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <code
                                      className="block bg-purple-200 dark:bg-purple-800/50 p-2 rounded text-xs font-mono overflow-x-auto my-2"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                                // Style paragraphs
                                p: ({ ...props }) => <p className="text-sm my-1" {...props} />,
                                // Style blockquotes
                                blockquote: ({ ...props }) => (
                                  <blockquote className="border-l-4 border-purple-400 pl-3 italic my-2" {...props} />
                                ),
                                // Style tables
                                table: ({ ...props }) => (
                                  <div className="overflow-x-auto my-2">
                                    <table className="min-w-full divide-y divide-purple-200 dark:divide-purple-800" {...props} />
                                  </div>
                                ),
                                thead: ({ ...props }) => (
                                  <thead className="bg-purple-100 dark:bg-purple-900/50" {...props} />
                                ),
                                th: ({ ...props }) => (
                                  <th className="px-3 py-2 text-left text-xs font-medium" {...props} />
                                ),
                                td: ({ ...props }) => (
                                  <td className="px-3 py-2 text-sm border-t border-purple-200 dark:border-purple-800" {...props} />
                                ),
                                // Style strong/bold
                                strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* AI Typing Indicator */}
            {isAITyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500">
                  <AvatarFallback className="text-xs">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start max-w-[75%]">
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <span className="font-medium">AI Assistant</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                      AI
                    </Badge>
                  </div>
                  <div className="rounded-lg px-3 py-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
            )
            }
            
            <div ref={scrollRef} />

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="text-xs text-muted-foreground">
                {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? "is" : "are"}{" "}
                typing...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message... (Use @AI to ask AI Assistant)"
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
          Press Enter to send, Shift + Enter for new line • Use @AI to ask questions
        </p>
      </div>
    </div>
  );
}
