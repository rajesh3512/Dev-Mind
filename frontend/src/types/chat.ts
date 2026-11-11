export type ProgrammingLanguage =
  | "Python"
  | "Java"
  | "C++"
  | "JavaScript";

export interface ChatRequest {
  question: string;
  language: ProgrammingLanguage;
}

export interface Conversation {
  id: number;
  title: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationSearchResult extends Conversation {
  match_type: "title" | "message";
  matched_message_id: number | null;
  matched_message_role: "user" | "assistant" | null;
  matched_message_preview: string | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  language: ProgrammingLanguage;
  created_at: string;
}

export interface ConversationChatResponse {
  status: string;
  conversation_id: number;
  question: string;
  language: ProgrammingLanguage;
  answer: string;
}

export interface CodeAnalysisRequest {
  code: string;
  language: ProgrammingLanguage;
}

export interface CodeAnalysisResponse {
  language: string;
  lines: number;
  characters: number;
  status: string;
}