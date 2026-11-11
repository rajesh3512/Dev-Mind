"use client";

import { useEffect, useRef } from "react";
import { Code2, Sparkles, User } from "lucide-react";
import type { Message } from "@/types/chat";

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatMessages({
  messages,
  loading,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          Loading conversation...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {messages.map((message) => {
        const isAssistant = message.role === "assistant";

        return (
          <div
            key={message.id}
            className={`flex gap-4 ${
              isAssistant ? "items-start" : "items-start"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                isAssistant
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-border bg-surface-elevated text-muted"
              }`}
            >
              {isAssistant ? (
                <Sparkles size={17} />
              ) : (
                <User size={17} />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {isAssistant ? "DevMind AI" : "You"}
                </span>

                <span className="text-[10px] text-muted">
                  {message.language}
                </span>
              </div>

              <div className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90">
                {message.content}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}