// ──────────────────────────────────────────────────────────
//  AdminChatManager — REST + Socket.IO wrapper
//  All events are logged to the browser console with [Chat] prefix
//  Mirrors the complete JS Chat Manager from chat_api_admin_web_do.md
// ──────────────────────────────────────────────────────────

import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import type {
  ChatRoom,
  ChatMessage,
  MessagesResponse,
  RoomsResponse,
  NewMessageSocketPayload,
  MessagesReadSocketPayload,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://10.10.7.106:5001/api/v1";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://10.10.7.106:5001";

// ── Console helpers ────────────────────────────────────────
const log = (msg: string, ...args: unknown[]) =>
  console.log(`[Chat] ${msg}`, ...args);
const warn = (msg: string, ...args: unknown[]) =>
  console.warn(`[Chat] ⚠️  ${msg}`, ...args);
const err = (msg: string, ...args: unknown[]) =>
  console.error(`[Chat] ❌ ${msg}`, ...args);

// ─────────────────────────────────────────────────────────
export class AdminChatManager {
  private token: string;
  public socket: Socket | null = null;
  public activeRoomId: string | null = null;

  constructor(token: string) {
    this.token = token;
  }

  // ── REST ─────────────────────────────────────────────────

  async getAllRooms(page = 1, limit = 20): Promise<RoomsResponse> {
    log(`📋 Fetching rooms (page ${page})...`);
    const res = await this._get(
      `/chat/my-rooms?page=${page}&limit=${limit}&sortOrder=desc`
    );
    log(`📋 Loaded ${res.data.length} rooms (total: ${res.pagination?.total})`);
    return { rooms: res.data as ChatRoom[], pagination: res.pagination };
  }

  async getMessages(
    chatRoomId: string,
    page = 1,
    limit = 30
  ): Promise<MessagesResponse> {
    log(`💬 Fetching messages for room ${chatRoomId} (page ${page})...`);
    const res = await this._get(
      `/chat/${chatRoomId}/messages?page=${page}&limit=${limit}&sortOrder=desc`
    );
    log(
      `💬 Loaded ${res.data.length} messages (total: ${res.pagination?.total})`
    );
    return { messages: res.data as ChatMessage[], pagination: res.pagination };
  }

  async sendTextMessage(chatRoomId: string, content: string): Promise<ChatMessage> {
    log(`✉️  Sending text message to room ${chatRoomId}`);

    // The /send-message route uses multer, which only parses multipart/form-data.
    // Send messageType and content as individual form fields so multer places
    // them directly on req.body — exactly what Zod validates against.
    const form = new FormData();
    form.append("messageType", "text");
    form.append("content", content);

    const res = await fetch(`${BASE_URL}/chat/send-message/${chatRoomId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      // Do NOT set Content-Type — browser sets multipart + boundary automatically
      body: form,
    });

    const json = await res.json();
    if (!json.success) {
      err(`sendTextMessage failed: ${json.message}`);
      throw new Error(json.message);
    }

    log(`✉️  Text message sent`, json.data?._id);
    return json.data as ChatMessage;
  }

  async sendFileMessage(
    chatRoomId: string,
    file: File,
    messageType: "image" | "pdf"
  ): Promise<ChatMessage> {
    log(`📎 Uploading ${messageType} "${file.name}" to room ${chatRoomId}`);

    // Send as multipart/form-data. The /send-message route uses multer,
    // which expects individual fields for validation (messageType)
    // and the file itself.
    const form = new FormData();
    form.append("messageType", messageType);
    form.append("file", file);

    const res = await fetch(`${BASE_URL}/chat/send-message/${chatRoomId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      // Browser automatically sets Content-Type to multipart/form-data with boundary
      body: form,
    });

    const json = await res.json();
    if (!json.success) {
      err(`sendFileMessage failed: ${json.message}`);
      throw new Error(json.message);
    }

    log(`📎 ${messageType} uploaded successfully`, json.data?._id);
    return json.data as ChatMessage;
  }

  async markAsRead(chatRoomId: string): Promise<void> {
    log(`👁️  Marking room ${chatRoomId} as read`);
    await this._patch(`/chat/${chatRoomId}/mark-read`);
    log(`👁️  Room ${chatRoomId} marked as read`);
  }

  // ── Socket ───────────────────────────────────────────────

  connectSocket({
    onNewMessage,
    onMessagesRead,
  }: {
    onNewMessage: (msg: NewMessageSocketPayload) => void;
    onMessagesRead: (payload: MessagesReadSocketPayload) => void;
  }): void {
    if (this.socket?.connected) {
      warn("Socket already connected — skipping reconnect");
      return;
    }

    log("🔌 Socket connecting...", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: this.token },
    });

    this.socket.on("connect", () => {
      log(`✅ Socket connected: ${this.socket!.id}`);
    });

    this.socket.on("connect_error", (e: Error) => {
      err(`Socket auth failed: ${e.message}`);
    });

    this.socket.on("disconnect", (reason: string) => {
      warn(`Socket disconnected: ${reason}`);
    });

    this.socket.on("newMessage", (message: NewMessageSocketPayload) => {
      log(
        `📨 New message in room ${message.chatRoom} from ${message.senderRole}: "${
          message.content?.slice(0, 40) ?? `[${message.messageType}]`
        }"`
      );
      onNewMessage(message);
    });

    this.socket.on(
      "messagesRead",
      (payload: MessagesReadSocketPayload) => {
        log(
          `👁️  Messages read in room ${payload.chatRoomId} by user ${payload.userId}`
        );
        onMessagesRead(payload);
      }
    );

    this.socket.on("joinedRoom", (roomId: string) => {
      log(`🏠 Joined room: ${roomId}`);
    });

    this.socket.on("roomError", (msg: string) => {
      err(`Room error: ${msg}`);
    });

    this.socket.on("messageError", (msg: string) => {
      err(`Message error: ${msg}`);
    });

    this.socket.on("readError", (msg: string) => {
      warn(`Read error: ${msg}`);
    });
  }

  joinRoom(chatRoomId: string): void {
    if (!this.socket?.connected) {
      warn(`Cannot join room ${chatRoomId} — socket not connected`);
      return;
    }
    log(`🏠 Joining room: ${chatRoomId}`);
    this.socket.emit("joinRoom", chatRoomId);
    this.activeRoomId = chatRoomId;
  }

  sendSocketMessage(content: string): void {
    if (!this.activeRoomId) {
      warn("sendSocketMessage called with no active room");
      return;
    }
    if (!this.socket?.connected) {
      warn("sendSocketMessage called but socket is disconnected");
      return;
    }
    log(`📤 Sending socket message to room ${this.activeRoomId}`);
    this.socket.emit("sendMessage", {
      chatRoomId: this.activeRoomId,
      messageType: "text",
      content,
    });
  }

  markReadSocket(chatRoomId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("markMessagesAsRead", chatRoomId);
    log(`👁️  Emitted markMessagesAsRead for room ${chatRoomId}`);
  }

  disconnect(): void {
    if (this.socket) {
      log("🔌 Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ── HTTP Helpers ─────────────────────────────────────────

  private async _get(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json();
    if (!data.success) {
      err(`GET ${path} failed: ${data.message}`);
      throw new Error(data.message);
    }
    return data;
  }

  private async _post(path: string, body: object) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success) {
      err(`POST ${path} failed: ${data.message}`);
      throw new Error(data.message);
    }
    return data.data;
  }

  private async _patch(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json();
    if (!data.success) {
      err(`PATCH ${path} failed: ${data.message}`);
      throw new Error(data.message);
    }
    return data;
  }
}

// ── Singleton factory ────────────────────────────────────
let _instance: AdminChatManager | null = null;

export function getChatManager(): AdminChatManager {
  const token = Cookies.get("token") ?? "";
  if (!_instance || !_instance.socket?.connected) {
    _instance = new AdminChatManager(token);
  }
  return _instance;
}
