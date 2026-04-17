// ──────────────────────────────────────────────────────────
//  CashFlow Chat — Shared TypeScript Types
//  Mirrors the data models from chat_api_admin_web_do.md
// ──────────────────────────────────────────────────────────

export interface ChatParticipant {
  _id: string;
  name: string;
  image?: string;
  avatar?: string;
}

export interface LastMessage {
  _id: string;
  messageType: "text" | "image" | "pdf";
  content?: string;
  fileUrl?: string;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  participants: string[];
  admin: ChatParticipant;
  user: ChatParticipant;
  lastMessage?: LastMessage;
  createdAt: string;
  updatedAt: string;
  /** Computed client-side from message readBy arrays */
  unreadCount?: number;
}

export interface ChatMessage {
  _id: string;
  chatRoom: string;
  sender: ChatParticipant;
  senderRole: "user" | "admin";
  messageType: "text" | "image" | "pdf";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy: string[];
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

export interface RoomsResponse {
  rooms: ChatRoom[];
  pagination: Pagination;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: Pagination;
}

export interface NewMessageSocketPayload extends ChatMessage {}

export interface MessagesReadSocketPayload {
  chatRoomId: string;
  userId: string;
}
