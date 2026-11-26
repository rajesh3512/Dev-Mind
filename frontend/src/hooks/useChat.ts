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
  Folder,
} from "@/types/chat";

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchResults, setSearchResults] = useState<ConversationSearchResult[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

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

  const displayedConversations:
    (Conversation | ConversationSearchResult)[] =
    searchQuery.trim() ? searchResults : conversations;

  // Load conversations
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

  // Load folders
  const loadFolders = useCallback(async () => {
    try {
      const data = await conversationService.listFolders();
      setFolders(data);
    } catch (err) {
      console.error("[DevMind] Failed to load folders:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load folders."
      );
    }
  }, []);

  useEffect(() => {
    void loadConversations();
    void loadFolders();
  }, [loadConversations, loadFolders]);

  // Search
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

  // Create conversation
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
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create conversation."
      );
      throw err;
    }
  }, []);

  // Open conversation
  const openConversation = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setMessages([]);

    try {
      const [conversation, conversationMessages] = await Promise.all([
        conversationService.get(id),
        conversationService.getMessages(id),
      ]);

      setActiveConversationId(conversation.id);
      setMessages(conversationMessages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open conversation."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (question: string, language: ProgrammingLanguage) => {
      const trimmedQuestion = question.trim();

      if (!trimmedQuestion || sending) return;

      setSending(true);
      setError(null);

      try {
        let conversationId = activeConversationId;

        if (conversationId === null) {
          const conversation = await conversationService.create(
            trimmedQuestion.slice(0, 50)
          );

          conversationId = conversation.id;
          setActiveConversationId(conversationId);

          setConversations((previous) =>
            sortConversations([conversation, ...previous])
          );
        }

        await conversationService.sendMessage(conversationId, {
          question: trimmedQuestion,
          language,
        });

        const updatedMessages =
          await conversationService.getMessages(conversationId);

        setMessages(updatedMessages);
        await loadConversations();
      } catch (err) {
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

  // Rename conversation
  const renameConversation = useCallback(
    async (id: number, title: string) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return;

      try {
        const updated = await conversationService.rename(id, trimmedTitle);

        setConversations((previous) =>
          sortConversations(
            previous.map((item) =>
              item.id === id ? { ...item, ...updated } : item
            )
          )
        );

        setSearchResults((previous) =>
          sortConversations(
            previous.map((item) =>
              item.id === id
                ? {
                    ...item,
                    title: updated.title,
                    updated_at: updated.updated_at,
                  }
                : item
            )
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to rename conversation."
        );
      }
    },
    []
  );

  // Pin / unpin
  const togglePinConversation = useCallback(
    async (id: number, isPinned: boolean) => {
      try {
        const updated = await conversationService.togglePin(id, isPinned);

        setConversations((previous) =>
          sortConversations(
            previous.map((item) =>
              item.id === id ? { ...item, ...updated } : item
            )
          )
        );

        setSearchResults((previous) =>
          sortConversations(
            previous.map((item) =>
              item.id === id
                ? {
                    ...item,
                    is_pinned: updated.is_pinned,
                    updated_at: updated.updated_at,
                  }
                : item
            )
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update conversation pin."
        );
      }
    },
    []
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (id: number) => {
      try {
        await conversationService.delete(id);

        setConversations((previous) =>
          previous.filter((item) => item.id !== id)
        );

        setSearchResults((previous) =>
          previous.filter((item) => item.id !== id)
        );

        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
      } catch (err) {
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
  // FOLDER OPERATIONS
  // ==========================================

  const createFolder = useCallback(async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      const folder = await conversationService.createFolder(trimmedName);
      setFolders((previous) => [...previous, folder]);
      return folder;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create folder."
      );
      throw err;
    }
  }, []);

  const renameFolder = useCallback(async (id: number, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      const updated = await conversationService.renameFolder(id, trimmedName);

      setFolders((previous) =>
        previous.map((folder) =>
          folder.id === id ? updated : folder
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to rename folder."
      );
      throw err;
    }
  }, []);

  const moveConversation = useCallback(
    async (conversationId: number, folderId: number | null) => {
      try {
        const updated = await conversationService.moveConversation(
          conversationId,
          folderId
        );

        setConversations((previous) =>
          sortConversations(
            previous.map((item) =>
              item.id === conversationId
                ? { ...item, ...updated }
                : item
            )
          )
        );

        setSearchResults((previous) =>
          previous.map((item) =>
            item.id === conversationId
              ? { ...item, folder_id: updated.folder_id }
              : item
          )
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to move conversation."
        );
        throw err;
      }
    },
    []
  );

  const deleteFolder = useCallback(async (id: number) => {
    try {
      await conversationService.deleteFolder(id);

      setFolders((previous) =>
        previous.filter((folder) => folder.id !== id)
      );

      await loadConversations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete folder."
      );
      throw err;
    }
  }, [loadConversations]);

  // Reset
  const resetChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    conversations: displayedConversations,
    allConversations: conversations,

    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveConversation,
    loadFolders,

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