"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { conversationService } from "@/services/conversationService";

import type {
  Conversation,
  ConversationSearchResult,
  Message,
  ProgrammingLanguage,
} from "@/types/chat";

// ==========================================
// CONVERSATION SORTING
// ==========================================

function sortConversations<T extends {
  is_pinned: boolean;
  updated_at: string;
}>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return Number(b.is_pinned) - Number(a.is_pinned);
    }

    return (
      new Date(b.updated_at).getTime() -
      new Date(a.updated_at).getTime()
    );
  });
}

export function useChat() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [searchResults, setSearchResults] =
    useState<ConversationSearchResult[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);

  const [searchError, setSearchError] = useState<string | null>(null);

  const [activeConversationId, setActiveConversationId] =
    useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const searchRequestId = useRef(0);

  // ==========================================
  // DISPLAYED CONVERSATIONS
  // ==========================================

  const displayedConversations:
    (Conversation | ConversationSearchResult)[] =
    searchQuery.trim() ? searchResults : conversations;

  // ==========================================
  // LOAD ALL CONVERSATIONS
  // ==========================================

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await conversationService.list();
      setConversations(sortConversations(data));
    } catch (err) {
      console.error("[DevMind] Failed to load conversations:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // ==========================================
  // DEBOUNCED SEARCH
  // ==========================================

  useEffect(() => {
    const query = searchQuery.trim();

    const requestId = ++searchRequestId.current;

    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    const timeout = setTimeout(async () => {
      try {
        const results = await conversationService.search(query);

        if (requestId === searchRequestId.current) {
          setSearchResults(sortConversations(results));
        }
      } catch (err) {
        if (requestId === searchRequestId.current) {
          console.error("[DevMind] Search failed:", err);

          setSearchError(
            err instanceof Error
              ? err.message
              : "Unable to search conversations."
          );

          setSearchResults([]);
        }
      } finally {
        if (requestId === searchRequestId.current) {
          setSearchLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // ==========================================
  // CREATE NEW CONVERSATION
  // ==========================================

  const createConversation = useCallback(async () => {
    setError(null);

    try {
      const conversation = await conversationService.create();

      setConversations((previous) =>
        sortConversations([conversation, ...previous])
      );

      setActiveConversationId(conversation.id);
      setMessages([]);

      return conversation;
    } catch (err) {
      console.error("[DevMind] Conversation creation failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create conversation."
      );

      throw err;
    }
  }, []);

  // ==========================================
  // OPEN EXISTING CONVERSATION
  // ==========================================

  const openConversation = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setMessages([]);

    try {
      const [conversation, conversationMessages] =
        await Promise.all([
          conversationService.get(id),
          conversationService.getMessages(id),
        ]);

      setActiveConversationId(conversation.id);
      setMessages(conversationMessages);
    } catch (err) {
      console.error("[DevMind] Failed to open conversation:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to open conversation."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = useCallback(
    async (
      question: string,
      language: ProgrammingLanguage
    ) => {
      const trimmedQuestion = question.trim();

      if (!trimmedQuestion || sending) return;

      setSending(true);
      setError(null);

      try {
        let conversationId = activeConversationId;

        if (conversationId === null) {
          const conversation =
            await conversationService.create(
              trimmedQuestion.slice(0, 50)
            );

          conversationId = conversation.id;

          setActiveConversationId(conversationId);

          setConversations((previous) =>
            sortConversations([conversation, ...previous])
          );
        }

        const response =
          await conversationService.sendMessage(
            conversationId,
            {
              question: trimmedQuestion,
              language,
            }
          );

        console.log("[DevMind] Message sent:", response.status);

        const updatedMessages =
          await conversationService.getMessages(conversationId);

        setMessages(updatedMessages);

        await loadConversations();
      } catch (err) {
        console.error("[DevMind] Message sending failed:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while sending your message."
        );
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, sending, loadConversations]
  );

  // ==========================================
  // RENAME CONVERSATION
  // ==========================================

  const renameConversation = useCallback(
    async (id: number, title: string) => {
      const trimmedTitle = title.trim();

      if (!trimmedTitle) return;

      setError(null);

      try {
        const updated = await conversationService.rename(
          id,
          trimmedTitle
        );

        setConversations((previous) =>
          sortConversations(
            previous.map((conversation) =>
              conversation.id === id
                ? { ...conversation, ...updated }
                : conversation
            )
          )
        );

        setSearchResults((previous) =>
          sortConversations(
            previous.map((conversation) =>
              conversation.id === id
                ? { ...conversation, title: updated.title,
                    updated_at: updated.updated_at }
                : conversation
            )
          )
        );
      } catch (err) {
        console.error("[DevMind] Rename failed:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to rename conversation."
        );
      }
    },
    []
  );

  // ==========================================
  // PIN / UNPIN CONVERSATION
  // ==========================================

  const togglePinConversation = useCallback(
    async (id: number, isPinned: boolean) => {
      setError(null);

      try {
        const updated = await conversationService.togglePin(
          id,
          isPinned
        );

        setConversations((previous) =>
          sortConversations(
            previous.map((conversation) =>
              conversation.id === id
                ? { ...conversation, ...updated }
                : conversation
            )
          )
        );

        setSearchResults((previous) =>
          sortConversations(
            previous.map((conversation) =>
              conversation.id === id
                ? {
                    ...conversation,
                    is_pinned: updated.is_pinned,
                    updated_at: updated.updated_at,
                  }
                : conversation
            )
          )
        );
      } catch (err) {
        console.error("[DevMind] Pin update failed:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to update conversation pin."
        );
      }
    },
    []
  );

  // ==========================================
  // DELETE CONVERSATION
  // ==========================================

  const deleteConversation = useCallback(
    async (id: number) => {
      setError(null);

      try {
        await conversationService.delete(id);

        setConversations((previous) =>
          previous.filter(
            (conversation) => conversation.id !== id
          )
        );

        setSearchResults((previous) =>
          previous.filter(
            (conversation) => conversation.id !== id
          )
        );

        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error("[DevMind] Failed to delete conversation:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to delete conversation."
        );
      }
    },
    [activeConversationId]
  );

  // ==========================================
  // RESET CHAT
  // ==========================================

  const resetChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  // ==========================================
  // EXPOSE FUNCTIONS
  // ==========================================

  return {
    conversations: displayedConversations,

    searchQuery,
    setSearchQuery,
    searchLoading,
    searchError,

    activeConversationId,
    messages,
    loading,
    sending,
    error,

    loadConversations,
    createConversation,
    openConversation,
    sendMessage,
    renameConversation,
    togglePinConversation,
    deleteConversation,
    resetChat,
  };
}