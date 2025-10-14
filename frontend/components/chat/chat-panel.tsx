"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockMessages, mockUsers } from "@/lib/mock-data";
import { Message } from "@/types";

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: String(messages.length + 1),
      content: newMessage,
      sender: mockUsers[0],
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold">Team Chat</h3>
          <p className="text-xs text-muted-foreground">
            {mockUsers.length} members
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.sender.id === mockUsers[0].id;
            const showAvatar =
              index === 0 ||
              messages[index - 1].sender.id !== message.sender.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isCurrentUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {showAvatar ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {message.sender.avatar || message.sender.name.slice(0, 2)}
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
                      <span className="font-medium">{message.sender.name}</span>
                      <span className="text-muted-foreground">
                        {formatTime(message.timestamp)}
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
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.issueId && (
                    <span className="mt-1 text-xs text-muted-foreground">
                      Related to issue #{message.issueId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
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
