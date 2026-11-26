"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  Code2,
  Bug,
  Zap,
  Terminal,
  ArrowUp,
  Paperclip,
  Menu,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  User,
  LoaderCircle,
  Trash2,
  Download,
  Printer,
} from "lucide-react";

import Sidebar from "./Sidebar";
import ThemeToggle from "../ui/ThemeToggle";
import { useChat } from "@/hooks/useChat";

import type {
  ProgrammingLanguage,
  Message,
} from "@/types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const languages: ProgrammingLanguage[] = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
];

const suggestions = [
  {
    title: "Understand code",
    description: "Break down complex logic into clear explanations.",
    icon: Code2,
    prompt: "Explain this code step by step: ",
    number: "01",
  },
  {
    title: "Find the problem",
    description: "Investigate errors and identify their root causes.",
    icon: Bug,
    prompt: "Help me debug this error: ",
    number: "02",
  },
  {
    title: "Improve performance",
    description: "Make your code cleaner, faster and more efficient.",
    icon: Zap,
    prompt: "Help me optimize this code: ",
    number: "03",
  },
  {
    title: "Build something",
    description: "Turn a programming idea into a working solution.",
    icon: Terminal,
    prompt: "Help me write code for: ",
    number: "04",
  },
];

// --------------------------------------------------
// BRAND VISUAL
// --------------------------------------------------

function BrandVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto mb-8 flex h-[150px] w-[190px] items-center justify-center">
      <svg
        viewBox="0 0 190 150"
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
        aria-label="DevMind connected-node visualisation"
        role="img"
      >
        <path
          d="M35 75 L75 35 L115 55 L155 25"
          className="brand-connection"
        />

        <path
          d="M35 75 L75 115 L115 95 L155 125"
          className="brand-connection"
        />

        <path
          d="M75 35 L75 115"
          className="brand-connection"
        />

        <path
          d="M115 55 L115 95"
          className="brand-connection"
        />

        <path
          d="M35 75 L75 35 L115 55 L155 25"
          className="brand-active-connection"
        />

        <path
          d="M35 75 L75 115 L115 95 L155 125"
          className="brand-active-connection"
          style={{ animationDelay: "-2s" }}
        />

        {[
          [35, 75],
          [75, 35],
          [115, 55],
          [155, 25],
          [75, 115],
          [115, 95],
          [155, 125],
        ].map(([cx, cy], index) => (
          <circle
            key={index}
            cx={cx}
            cy={cy}
            r={index === 0 ? 5 : 3.5}
            className="brand-node"
          />
        ))}

        {!reduceMotion && (
          <motion.circle
            r="3"
            fill="var(--accent)"
            className="brand-travelling-light"
            initial={{ cx: 35, cy: 75 }}
            animate={{
              cx: [35, 75, 115, 155],
              cy: [75, 35, 55, 25],
            }}
            transition={{
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        )}
      </svg>

      <div className="relative z-10 flex h-[66px] w-[66px] items-center justify-center rounded-[20px] border border-accent/30 bg-surface shadow-[0_8px_30px_rgba(70,90,150,0.08)]">
        <Code2
          size={29}
          strokeWidth={1.5}
          className="text-accent"
        />

        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-accent" />
      </div>
    </div>
  );
}

// --------------------------------------------------
// MESSAGE COMPONENT
// --------------------------------------------------


function ChatMessage({
    message,
    isSearchTarget = false,
}: {
    message: Message;
    isSearchTarget?: boolean;
}) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      data-message-id={message.id}
      data-message-role={message.role}
      className={`flex items-start gap-4 rounded-xl scroll-mt-6 transition-all duration-500 ${
    isSearchTarget
        ? "bg-accent/10 ring-2 ring-accent/50 ring-offset-4 ring-offset-background"
        : ""
     }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
          isAssistant
            ? "border-accent/30 bg-accent/10 text-accent"
            : "border-border bg-surface-elevated text-muted"
        }`}
      >
        {isAssistant ? <Sparkles size={17} /> : <User size={17} />}
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

        {isAssistant ? (
          <div className="max-w-none break-words text-sm leading-7 text-foreground/90
            [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-bold
            [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold
            [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold
            [&_p]:mb-3
            [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6
            [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6
            [&_li]:pl-1
            [&_strong]:font-semibold [&_strong]:text-foreground
            [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-muted
            [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4
            [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse
            [&_th]:border [&_th]:border-border [&_th]:bg-surface-elevated [&_th]:px-3 [&_th]:py-2 [&_th]:text-left
            [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2
            [&_hr]:my-5 [&_hr]:border-border"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre({ children }) {
                  return (
                    <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-surface-elevated p-4 text-[13px] leading-6">
                      {children}
                    </pre>
                  );
                },
                code({ className, children, ...props }) {
                  const isBlock = Boolean(className);

                  return (
                    <code
                      className={
                        isBlock
                          ? `${className ?? ""} font-mono`
                          : "rounded-md border border-border bg-surface-elevated px-1.5 py-0.5 font-mono text-[12px] text-accent"
                      }
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------
// MAIN WORKSPACE
// --------------------------------------------------

export default function Workspace() {
  // STATES

  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] =
    useState<ProgrammingLanguage>("Python");
  const [searchTargetMessageId, setSearchTargetMessageId] = useState<number | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const [languageOpen, setLanguageOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // CHAT ENGINE

  const {
    conversations,
    folders,

    createFolder,
    renameFolder,
    deleteFolder,
    moveConversation,

    searchQuery,
    setSearchQuery,
    searchLoading,
    searchError,

    activeConversationId,
    messages,
    loading,
    sending,
    error,

    openConversation,
    sendMessage,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    resetChat,
  } = useChat();

  // AUTO-SCROLL TO THE LATEST USER QUESTION
    useEffect(() => {
    const container = messagesContainerRef.current;

    if (
        !container ||
        messages.length === 0 ||
        loading ||
        searchTargetMessageId !== null
    ) {
        return;
    }

    let secondFrame = 0;

    const firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
            const userMessages = container.querySelectorAll(
                '[data-message-role="user"]'
            );

            const latestQuestion = userMessages[
                userMessages.length - 1
            ] as HTMLElement | undefined;

            if (!latestQuestion) return;

            const containerRect = container.getBoundingClientRect();
            const questionRect = latestQuestion.getBoundingClientRect();

            const targetPosition =
                container.scrollTop +
                questionRect.top -
                containerRect.top -
                16;

            container.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: "smooth",
            });
        });
    });

    return () => {
        cancelAnimationFrame(firstFrame);
        cancelAnimationFrame(secondFrame);
    };
}, [messages, loading, searchTargetMessageId]);


useEffect(() => {
    if (
        loading ||
        searchTargetMessageId === null ||
        messages.length === 0
    ) {
        return;
    }

    const matchingMessage = messages.find(
        (message) => message.id === searchTargetMessageId
    );

    if (!matchingMessage) {
        setSearchTargetMessageId(null);
        return;
    }

    let secondFrame = 0;

    const firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
            const container = messagesContainerRef.current;

            if (!container) return;

            const targetElement = container.querySelector(
                `[data-message-id="${searchTargetMessageId}"]`
            );

            targetElement?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        });
    });

    const highlightTimeout = window.setTimeout(() => {
        setSearchTargetMessageId((current) =>
            current === searchTargetMessageId ? null : current
        );
    }, 2500);

    return () => {
        cancelAnimationFrame(firstFrame);
        cancelAnimationFrame(secondFrame);
        window.clearTimeout(highlightTimeout);
    };
}, [messages, loading, searchTargetMessageId]);
  // CHAT STATE

  const isChatActive = activeConversationId !== null;

  useEffect(() => {
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  // --------------------------------------------------
  // HANDLERS
  // --------------------------------------------------

  const handleSend = async () => {
    const currentPrompt = prompt.trim();

    if (!currentPrompt || sending) {
        return;
    }

    await sendMessage(currentPrompt, language);

    setPrompt("");
    };

  const handleSuggestion = (suggestion: string) => {
    setPrompt(suggestion);

    setTimeout(() => {
      document.getElementById("devmind-prompt")?.focus();
    }, 100);
  };

  const handleNewConversation = () => {
    resetChat();
    setPrompt("");
    setSidebarOpen(false);
  };

  // EXPORT THE CURRENT CONVERSATION AS MARKDOWN
  const handleExportMarkdown = () => {
    if (!activeConversationId || messages.length === 0 || loading || sending) {
      return;
    }

    const activeConversation = conversations.find(
      (conversation) => conversation.id === activeConversationId
    );

    const title =
      activeConversation?.title?.trim() ||
      `Conversation ${activeConversationId}`;

    const exportedAt = new Date().toLocaleString();

    const markdown = [
      `# ${title}`,
      "",
      `> Exported from DevMind AI on ${exportedAt}`,
      "",
      "---",
      "",
      ...messages.flatMap((message) => [
        `## ${message.role === "assistant" ? "DevMind AI" : "You"}`,
        "",
        `**Language:** ${message.language}`,
        "",
        message.content,
        "",
        "---",
        "",
      ]),
    ].join("\n");

    const safeFilename = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || `conversation-${activeConversationId}`;

    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `${safeFilename}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  };

  // The browser print dialog provides the "Save as PDF" option.
  const handleExportPdf = () => {
    if (!activeConversationId || messages.length === 0 || loading || sending) {
      return;
    }

    setIsPrinting(true);
    window.setTimeout(() => window.print(), 300);
  };

  const handleOpenConversation = async (
    id: number,
    messageId?: number | null
  ) => {
    setPrompt("");
    setSearchTargetMessageId(messageId ?? null);
    await openConversation(id);
  };

  const handleDeveloperTool = (suggestion: string) => {
    handleSuggestion(suggestion);
    setSidebarOpen(false);
  };

  // SIDEBAR PROPS

  const sidebarProps = {
  conversations,
  folders,
  activeConversationId,

  searchQuery,
  onSearchChange: setSearchQuery,
  searchLoading,
  searchError,

  onNewConversation: handleNewConversation,
  onSelectConversation: handleOpenConversation,
  onDeleteConversation: deleteConversation,
  onRenameConversation: renameConversation,
  onTogglePinConversation: togglePinConversation,

  onCreateFolder: createFolder,
  onRenameFolder: renameFolder,
  onDeleteFolder: deleteFolder,
  onMoveConversation: moveConversation,

  onDeveloperTool: handleDeveloperTool,
};

  // --------------------------------------------------
  // REUSABLE COMPOSER
  // --------------------------------------------------

  const renderComposer = () => (
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
            void handleSend();
          }
        }}
        placeholder="What are you working through today?"
        rows={3}
        className="w-full resize-none bg-transparent px-5 pt-5 text-sm leading-7 text-foreground outline-none placeholder:text-muted/80 disabled:opacity-60 sm:px-6"
      />

      <div className="flex items-center justify-between gap-3 px-4 pb-4 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            aria-label="Attach file"
            title="File attachments coming soon"
            className="rounded-lg p-2 text-muted opacity-50"
          >
            <Paperclip size={17} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen(!languageOpen)}
              aria-expanded={languageOpen}
              disabled={sending || loading}
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
          onClick={() => void handleSend()}
          disabled={!prompt.trim() || sending}
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
  );

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-background">
      <style>{`
        .print-only { display: none; }

        @page { size: auto; margin: 18mm; }

        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
          }
          body * { visibility: hidden !important; }
          .print-only, .print-only * { visibility: visible !important; }
          .print-only {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            padding: 0 !important;
            color: #171717 !important;
            background: #ffffff !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10pt !important;
            line-height: 1.55 !important;
          }
          .print-only > h1 {
            margin: 0 0 6pt !important;
            color: #111111 !important;
            font-size: 22pt !important;
            font-weight: 700 !important;
          }
          .print-only .print-meta {
            margin-bottom: 18pt !important;
            color: #666666 !important;
            font-size: 9pt !important;
          }
          .print-only .print-message {
            display: flex !important;
            gap: 10pt !important;
            margin: 0 0 18pt !important;
            padding: 0 0 14pt !important;
            border-bottom: 1px solid #dddddd !important;
            break-inside: auto;
          }
          .print-only .print-message > div:first-child { display: none !important; }
          .print-only .print-message > div:last-child {
            min-width: 0 !important;
            color: #222222 !important;
          }
          .print-only .print-message span,
          .print-only .print-message p,
          .print-only .print-message li,
          .print-only .print-message h1,
          .print-only .print-message h2,
          .print-only .print-message h3,
          .print-only .print-message strong {
            color: #222222 !important;
          }
          .print-only pre {
            max-width: 100% !important;
            overflow-wrap: anywhere !important;
            white-space: pre-wrap !important;
            border: 1px solid #dddddd !important;
            border-radius: 5px !important;
            background: #f5f5f5 !important;
            color: #111111 !important;
            padding: 10pt !important;
            font-size: 8pt !important;
          }
          .print-only code {
            color: #111111 !important;
            font-family: Consolas, "Courier New", monospace !important;
            overflow-wrap: anywhere !important;
          }
          .print-only table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8pt !important;
          }
          .print-only th, .print-only td {
            border: 1px solid #cccccc !important;
            padding: 5pt !important;
            color: #222222 !important;
          }
          .print-only a {
            color: #174ea6 !important;
            text-decoration: underline !important;
          }
        }
      `}</style>

      {isPrinting && (
        <div className="print-only" aria-hidden="true">
          <h1>
            {conversations.find(
              (conversation) => conversation.id === activeConversationId
            )?.title?.trim() || `Conversation ${activeConversationId}`}
          </h1>
          <p className="print-meta">
            Exported from DevMind AI on {new Date().toLocaleString()}
          </p>
          {messages.map((message) => (
            <div key={message.id} className="print-message">
              <ChatMessage message={message} />
            </div>
          ))}
        </div>
      )}

    {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-60" />

      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-accent/[0.045] blur-[120px]" />

      {/* DESKTOP SIDEBAR */}

      <div className="relative z-20 hidden h-full shrink-0 md:block">
        <Sidebar
          {...sidebarProps}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() =>
            setSidebarCollapsed(!sidebarCollapsed)
          }
        />
      </div>

      {/* MOBILE SIDEBAR */}

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 h-screen md:hidden"
            >
              <Sidebar
                {...sidebarProps}
                mobile
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}

      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}

        <header className="relative z-10 flex h-[72px] shrink-0 items-center justify-between border-b border-border/50 px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-elevated hover:text-foreground md:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <Code2 size={18} strokeWidth={1.8} />
              </div>

              <span className="text-sm font-semibold tracking-tight text-foreground">
                DevMind <span className="text-accent">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />

              <span className="text-[11px] tracking-wide text-muted">
                DEVELOPER SPACE
              </span>
            </div>

            <div className="h-5 w-px bg-border" />

            <ThemeToggle />
          </div>
        </header>

        {/* WORKSPACE CONTENT */}

        <section
            className={`relative flex min-h-0 flex-1 flex-col ${
                isChatActive
                ? "overflow-hidden"
                : "overflow-y-auto overscroll-contain"
            }`}
            >
          <AnimatePresence mode="wait">
            {!isChatActive ? (
              // LANDING PAGE

              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="mx-auto w-full max-w-[790px] px-5 pb-12 pt-12 sm:px-8 sm:pt-14 lg:pt-16"
              >
                <BrandVisual />

                <div className="text-center">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5">
                    <Sparkles size={12} className="text-accent" />

                    <span className="text-[9px] font-semibold tracking-[0.2em] text-muted">
                      YOUR INTELLIGENT DEVELOPMENT SPACE
                    </span>
                  </div>

                  <motion.h1
                    className="editorial-heading text-[38px] text-foreground sm:text-[54px] lg:text-[66px]"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.22 },
                      },
                    }}
                  >
                    {["THE QUIET", "COLLABORATOR"].map((line, index) => (
                      <span key={line} className="heading-mask">
                        <motion.span
                          className={`heading-reveal ${
                            index === 1 ? "text-accent" : ""
                          }`}
                          variants={{
                            hidden: { y: "105%", opacity: 0 },
                            visible: {
                              y: "0%",
                              opacity: 1,
                              transition: {
                                duration: 0.85,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            },
                          }}
                        >
                          {line}
                        </motion.span>
                      </span>
                    ))}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.75 }}
                    className="mx-auto mt-6 max-w-[500px] text-sm leading-7 text-muted sm:text-[15px]"
                  >
                    An intelligent space to think through problems,
                    understand code, and build better software —
                    one step at a time.
                  </motion.p>
                </div>

                {/* COMPOSER */}

                <div className="mt-11">
                  {renderComposer()}

                  <p className="mt-3 text-center text-[10px] tracking-wide text-muted">
                    ENTER TO SEND
                    <span className="mx-1 text-border">·</span>
                    SHIFT + ENTER FOR A NEW LINE
                  </p>
                </div>

                {/* DEVELOPER ACTIONS */}

                <div className="mt-14">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                      A place to begin
                    </p>

                    <span className="text-[10px] text-muted">
                      EXPLORE YOUR TOOLS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {suggestions.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.button
                          key={item.title}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.2 + index * 0.08,
                          }}
                          onClick={() => handleSuggestion(item.prompt)}
                          className="action-panel group relative flex min-h-[112px] items-start gap-4 overflow-hidden rounded-xl border border-border bg-surface/80 p-4 text-left"
                        >
                          <span className="absolute right-4 top-3 text-[10px] tracking-wider text-muted/50">
                            {item.number}
                          </span>

                          <div className="action-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated text-muted">
                            <Icon size={19} strokeWidth={1.7} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">
                              {item.title}
                            </h3>

                            <p className="mt-1 max-w-[230px] text-xs leading-5 text-muted">
                              {item.description}
                            </p>
                          </div>

                          <ArrowUpRight
                            size={15}
                            className="action-arrow absolute bottom-4 right-4 text-muted/50"
                          />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* FOOTER */}

                <footer className="mt-16 border-t border-border/60 pt-5 text-center">
                  <p className="text-[10px] tracking-[0.12em] text-muted">
                    BUILT FOR DEVELOPERS
                    <span className="mx-2 text-border">·</span>
                    POWERED BY INTELLIGENCE
                  </p>
                </footer>
              </motion.div>
            ) : (
              // CHAT INTERFACE

              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto flex h-full min-h-0 w-full max-w-[900px] flex-1 flex-col overflow-hidden px-5 sm:px-8"
              >
                <div className="flex items-center justify-between border-b border-border/50 py-5">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Conversation
                    </p>

                    <p className="mt-1 text-[10px] text-muted">
                      Your development workspace
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      disabled={messages.length === 0 || loading || sending}
                      title="Export conversation as Markdown"
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Export .md</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPdf}
                      disabled={messages.length === 0 || loading || sending}
                      title="Print or save conversation as PDF"
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Printer size={14} />
                      <span className="hidden sm:inline">Export PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNewConversation}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
                    >
                      <Trash2 size={14} />
                      New chat
                    </button>
                  </div>
                </div>

                <div
                    ref={messagesContainerRef}
                    className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain py-8"
                >
                  {loading ? (
                    <div className="flex items-center justify-center py-16 text-sm text-muted">
                      <LoaderCircle
                        size={17}
                        className="mr-3 animate-spin"
                      />
                      Loading conversation...
                    </div>
                  ) : (
                    messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isSearchTarget={message.id === searchTargetMessageId}
                      />
                    ))
                  )}

                  {sending && (
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <Sparkles
                        size={15}
                        className="animate-pulse text-accent"
                      />
                      DevMind is thinking...
                    </div>
                  )}
                </div>

                <div className="z-10 shrink-0 border-t border-border/50 bg-background/95 py-5 backdrop-blur-sm">
                  {renderComposer()}

                  <p className="mt-3 text-center text-[10px] tracking-wide text-muted">
                    ENTER TO SEND
                    <span className="mx-1 text-border">·</span>
                    SHIFT + ENTER FOR A NEW LINE
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ERROR MESSAGE */}

          {error && (
            <div
              role="alert"
              className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-red-500/30 bg-surface px-4 py-3 text-xs text-red-500 shadow-xl"
            >
              {error}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}