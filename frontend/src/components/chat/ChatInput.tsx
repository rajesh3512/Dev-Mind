"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Code2,
  ChevronDown,
  Paperclip,
  LoaderCircle,
} from "lucide-react";

import type { ProgrammingLanguage } from "@/types/chat";

const languages: ProgrammingLanguage[] = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
];

interface ChatInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  language: ProgrammingLanguage;
  setLanguage: (value: ProgrammingLanguage) => void;
  onSend: () => void;
  sending: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  prompt,
  setPrompt,
  language,
  setLanguage,
  onSend,
  sending,
  disabled = false,
}: ChatInputProps) {
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <div>
      <div className="composer-group relative rounded-2xl border border-border bg-surface shadow-[0_12px_45px_rgba(30,30,30,0.055)] transition-all duration-300 focus-within:border-accent/60 focus-within:shadow-[0_15px_50px_rgba(90,110,170,0.10)]">
        <div className="composer-accent absolute left-5 right-5 top-0 h-[2px] rounded-full bg-accent" />

        <textarea
          id="devmind-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="What are you working through today?"
          rows={3}
          disabled={sending || disabled}
          className="w-full resize-none bg-transparent px-5 pt-5 text-sm leading-7 text-foreground outline-none placeholder:text-muted/80 disabled:opacity-60 sm:px-6"
        />

        <div className="flex items-center justify-between gap-3 px-4 pb-4 sm:px-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Attach file"
              title="File attachments coming soon"
              disabled
              className="rounded-lg p-2 text-muted opacity-50"
            >
              <Paperclip size={17} />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen(!languageOpen)}
                aria-expanded={languageOpen}
                disabled={sending || disabled}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <Code2 size={14} />
                {language}
                <ChevronDown size={13} />
              </button>

              <AnimatePresence>
                {languageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 z-30 mb-2 w-36 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-xl"
                  >
                    {languages.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setLanguage(item);
                          setLanguageOpen(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-surface-elevated ${
                          language === item
                            ? "text-accent"
                            : "text-foreground"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={!prompt.trim() || sending || disabled}
            aria-label="Send message"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {sending ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <ArrowUp size={19} />
            )}
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] tracking-wide text-muted">
        ENTER TO SEND <span className="mx-1 text-border">·</span>
        SHIFT + ENTER FOR A NEW LINE
      </p>
    </div>
  );
}