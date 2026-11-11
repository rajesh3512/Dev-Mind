import { apiRequest } from "./api";

import type {
  Conversation,
  ConversationSearchResult,
  Message,
  ChatRequest,
  ConversationChatResponse,
} from "@/types/chat";

export const conversationService = {
  create: (title = "New Conversation") =>
    apiRequest<Conversation>("/conversations/", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  list: () => apiRequest<Conversation[]>("/conversations/"),

  search: (query: string) =>
    apiRequest<ConversationSearchResult[]>(
      `/conversations/search?q=${encodeURIComponent(query)}`
    ),

  get: (id: number) =>
    apiRequest<Conversation>(`/conversations/${id}`),

  getMessages: (id: number) =>
    apiRequest<Message[]>(`/conversations/${id}/messages`),

  sendMessage: (id: number, request: ChatRequest) =>
    apiRequest<ConversationChatResponse>(
      `/conversations/${id}/chat`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    ),

    rename: (id: number, title: string) =>
        apiRequest<Conversation>(`/conversations/${id}/rename`, {
            method: "PATCH",
            body: JSON.stringify({ title }),
        }),

    togglePin: (id: number, is_pinned: boolean) =>
        apiRequest<Conversation>(`/conversations/${id}/pin`, {
            method: "PATCH",
            body: JSON.stringify({ is_pinned }),
        }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/conversations/${id}`, {
      method: "DELETE",
    }),
};