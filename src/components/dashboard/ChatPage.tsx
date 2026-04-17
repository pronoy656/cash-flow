"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  SendHorizontal,
  Paperclip,
  FileText,
  Loader2,
  MessageSquareOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getChatManager } from "@/lib/chat/chatManager";
import type { ChatRoom, ChatMessage, Pagination } from "@/lib/chat/types";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Console helpers
const log = (msg: string, ...args: unknown[]) =>
  console.log(`[Chat] ${msg}`, ...args);

/**
 * Deduplicate a message array by _id, keeping the last occurrence
 * (so a real server message replaces any same-_id optimistic entry).
 */
function dedupe(msgs: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const m of msgs) map.set(m._id, m);
  return Array.from(map.values());
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  // ── room list
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [roomPage, setRoomPage] = useState(1);
  const [roomPagination, setRoomPagination] = useState<Pagination | null>(null);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  // ── active room
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgPagination, setMsgPagination] = useState<Pagination | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // ── input
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const managerRef = useRef(getChatManager());

  const inputRef = useRef<HTMLInputElement>(null); // 👈 ADD THIS

  /**
   * The admin's own user _id — used to recognise ourself in socket events.
   * Populated from the first room that loads (admin._id is always the same).
   */
  const adminIdRef = useRef<string | null>(null);

  // ── scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── append a message to state with strict _id dedup
  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev; // already present
      return [...prev, msg];
    });
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // Load rooms
  // ────────────────────────────────────────────────────────────────────────
  const loadRooms = useCallback(
    async (page = 1) => {
      try {
        setRoomsLoading(page === 1);
        setRoomsError(null);

        const { rooms: fetched, pagination } =
          await managerRef.current.getAllRooms(page, 20);

        setRooms((prev) =>
          page === 1 ? fetched : [...prev, ...fetched]
        );
        setRoomPagination(pagination);
        setRoomPage(page);

        // Capture admin _id from first room.
        // In the admin dashboard, the 'admin' object in each room
        // represents the current logged-in admin user.
        if (fetched.length > 0 && !adminIdRef.current) {
          const firstRoom = fetched[0];
          adminIdRef.current = firstRoom.admin?._id || null;
          console.log("[Chat] 🔑 Admin ID captured:", adminIdRef.current);
        }

        // Join every room so we receive live events from all users
        fetched.forEach((r) => managerRef.current.joinRoom(r._id));

        // Auto-open first room on initial load
        if (page === 1 && fetched.length > 0) {
          openRoom(fetched[0]);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load rooms";
        setRoomsError(msg);
        toast.error(msg);
      } finally {
        setRoomsLoading(false);
      }
    },
    // openRoom is stable (defined below with useCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ────────────────────────────────────────────────────────────────────────
  // Load messages
  // ────────────────────────────────────────────────────────────────────────
  const loadMessages = useCallback(
    async (roomId: string, page = 1) => {
      try {
        if (page === 1) setMessagesLoading(true);
        else setLoadingOlder(true);

        const { messages: fetched, pagination } =
          await managerRef.current.getMessages(roomId, page, 30);

        // API returns newest-first → reverse so oldest is at the top.
        // Also normalise senderRole using the real admin _id so alignment
        // is always correct regardless of what the server field contains.
        const ordered = [...fetched]
          .reverse()
          .map((msg) => ({
            ...msg,
            senderRole:
              msg.sender?._id === adminIdRef.current
                ? ("admin" as const)
                : ("user" as const),
          }));

        setMessages((prev) =>
          page === 1 ? ordered : dedupe([...ordered, ...prev])
        );
        setMsgPagination(pagination);
        setMsgPage(page);

        if (page === 1) setTimeout(scrollToBottom, 100);

        // Mark room as read (REST + socket)
        managerRef.current.markAsRead(roomId).catch(() => { });
        managerRef.current.markReadSocket(roomId);

        // Clear unread badge
        setRooms((prev) =>
          prev.map((r) =>
            r._id === roomId ? { ...r, unreadCount: 0 } : r
          )
        );
      } catch (e: unknown) {
        const errmsg =
          e instanceof Error ? e.message : "Failed to load messages";
        toast.error(errmsg);
      } finally {
        setMessagesLoading(false);
        setLoadingOlder(false);
      }
    },
    [scrollToBottom]
  );

  // ────────────────────────────────────────────────────────────────────────
  // Open a room
  // ────────────────────────────────────────────────────────────────────────
  const openRoom = useCallback(
    (room: ChatRoom) => {
      setActiveRoom(room);
      setMessages([]);
      setMsgPage(1);
      setMsgPagination(null);
      managerRef.current.activeRoomId = room._id;
      loadMessages(room._id, 1);

      // ✅ smooth focus after UI render
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [loadMessages]
  ); // 👈 ADD THIS

  // ────────────────────────────────────────────────────────────────────────
  // Socket setup — runs once on mount
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const manager = managerRef.current;

    manager.connectSocket({
      onNewMessage: (msg) => {
        /**
         * ALIGNMENT RULES (applied here, not in the render):
         *
         *  senderRole === "admin"  → RIGHT  (admin bubble)
         *  senderRole === "user"   → LEFT   (user bubble)
         *
         * HOW WE PREVENT DUPLICATES:
         *  - Admin sends via REST → we get the confirmed ChatMessage back
         *    and add it directly with senderId-based check.
         *  - The server also broadcasts that same message as a newMessage
         *    socket event. We skip it if sender ID matches our adminIdRef.
         */

        const senderId =
          typeof msg.sender === "string" ? msg.sender : msg.sender?._id;

        // Skip echoes of messages WE sent (prevents duplication)
        if (adminIdRef.current && senderId === adminIdRef.current) {
          log("↩️  Skipping own socket echo:", msg._id);
          return;
        }

        log("📨 New socket message arrived:", msg._id, "from:", senderId);

        // Append to active room if it matches
        setActiveRoom((ar) => {
          if (ar?._id === msg.chatRoom) {
            setMessages((prev) => {
              if (prev.some((m) => m._id === msg._id)) return prev;
              return [...prev, msg];
            });
            setTimeout(scrollToBottom, 60);
          }
          return ar;
        });

        // Update inbox preview + unread badge
        setRooms((prev) =>
          prev.map((r) => {
            if (r._id !== msg.chatRoom) return r;
            const isCurrentlyActive =
              managerRef.current.activeRoomId === r._id;

            return {
              ...r,
              lastMessage: {
                _id: msg._id,
                messageType: msg.messageType,
                content: msg.content,
                fileUrl: msg.fileUrl,
                createdAt: msg.createdAt,
              },
              // Only increment unread if NOT the active room AND NOT our own message
              unreadCount:
                isCurrentlyActive || senderId === adminIdRef.current
                  ? 0
                  : (r.unreadCount ?? 0) + 1,
            };
          })
        );
      },

      onMessagesRead: ({ chatRoomId }) => {
        setRooms((prev) =>
          prev.map((r) =>
            r._id === chatRoomId ? { ...r, unreadCount: 0 } : r
          )
        );
      },
    });

    loadRooms(1);

    return () => {
      manager.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // Send text — REST (not socket emit) so we get back a confirmed message
  // with the real _id and senderRole:"admin" from the server.
  // ────────────────────────────────────────────────────────────────────────
  // const sendText = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const text = messageText.trim();
  //   if (!text || !activeRoom || sending) return;

  //   setMessageText("");
  //   setSending(true);

  //   try {
  //     // POST to REST — returns the saved ChatMessage (senderRole:"admin")
  //     const saved = await managerRef.current.sendTextMessage(
  //       activeRoom._id,
  //       text
  //     );

  //     // Guarantee senderRole is "admin" regardless of what the server returns
  //     appendMessage({ ...saved, senderRole: "admin" });
  //     setTimeout(scrollToBottom, 60);

  //     // Update inbox last message preview
  //     setRooms((prev) =>
  //       prev.map((r) =>
  //         r._id === activeRoom._id
  //           ? {
  //             ...r,
  //             lastMessage: {
  //               _id: saved._id,
  //               messageType: "text",
  //               content: text,
  //               createdAt: saved.createdAt,
  //             },
  //           }
  //           : r
  //       )
  //     );
  //   } catch (e: unknown) {
  //     const errmsg = e instanceof Error ? e.message : "Send failed";
  //     toast.error(errmsg);
  //     setMessageText(text); // restore on failure
  //   } finally {
  //     setSending(false);
  //   }
  // };

  const sendText = async (e: React.FormEvent) => {
    e.preventDefault();

    const text = messageText.trim();
    if (!text || !activeRoom || sending) return;

    setMessageText(""); // ✅ instant clear
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    // inputRef.current?.focus(); // ✅ instant focus (no delay feeling)
    setSending(true);

    try {
      const saved = await managerRef.current.sendTextMessage(
        activeRoom._id,
        text
      );

      appendMessage({ ...saved, senderRole: "admin" });
      setTimeout(scrollToBottom, 60);

      setRooms((prev) =>
        prev.map((r) =>
          r._id === activeRoom._id
            ? {
              ...r,
              lastMessage: {
                _id: saved._id,
                messageType: "text",
                content: text,
                createdAt: saved.createdAt,
              },
            }
            : r
        )
      );

    } catch (e: unknown) {
      const errmsg = e instanceof Error ? e.message : "Send failed";
      toast.error(errmsg);

      // restore text if failed
      setMessageText(text);
    } finally {
      setSending(false);

      // ✅ ensure focus even after async delay
      // setTimeout(() => inputRef.current?.focus(), 0);
    }
  }; // 👈 ADD THIS

  // ────────────────────────────────────────────────────────────────────────
  // Send file — REST
  // ────────────────────────────────────────────────────────────────────────
  const sendFile = async (file: File) => {
    if (!activeRoom) return;
    const type = file.type.startsWith("image/") ? "image" : "pdf";
    setSending(true);
    try {
      const saved = await managerRef.current.sendFileMessage(
        activeRoom._id,
        file,
        type
      );

      // Force admin alignment
      appendMessage({ ...saved, senderRole: "admin" });
      setTimeout(scrollToBottom, 60);
    } catch (e: unknown) {
      const errmsg = e instanceof Error ? e.message : "Upload failed";
      toast.error(errmsg);
    } finally {
      setSending(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Load older messages (infinite scroll up)
  // ────────────────────────────────────────────────────────────────────────
  const loadOlderMessages = useCallback(() => {
    if (!activeRoom || loadingOlder) return;
    if (msgPagination && msgPage >= msgPagination.totalPage) return;
    loadMessages(activeRoom._id, msgPage + 1);
  }, [activeRoom, loadingOlder, msgPagination, msgPage, loadMessages]);

  // ── filtered room list
  const filteredRooms = rooms.filter((r) =>
    r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-12 h-[calc(100vh-180px)] min-h-[500px] gap-4">

      {/* ── LEFT PANEL: Room Inbox ──────────────────────────────────────── */}
      <div className="col-span-3 rounded-xl border border-white/10 bg-white/5 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-lg font-semibold mb-3">Support Inbox</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {roomsLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-white/50">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs">Loading conversations…</span>
            </div>
          ) : roomsError ? (
            <div className="p-4 flex flex-col items-center gap-3 text-center">
              <p className="text-red-400 text-xs">{roomsError}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadRooms(1)}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white gap-1.5"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">
              No conversations found
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredRooms.map((room) => {
                const user = room.user;
                const isActive = activeRoom?._id === room._id;
                const preview =
                  room.lastMessage?.content ??
                  (room.lastMessage?.messageType === "image"
                    ? "📷 Image"
                    : room.lastMessage?.messageType === "pdf"
                      ? "📄 PDF"
                      : "No messages yet");
                const unread = room.unreadCount ?? 0;

                return (
                  <button
                    key={room._id}
                    onClick={() => openRoom(room)}
                    className={`w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-all border-l-2 ${isActive
                      ? "border-[var(--brand)] bg-white/10"
                      : "border-transparent hover:border-white/20"
                      }`}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      {user?.image && (
                        <AvatarImage src={user.image} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-white/10 text-[var(--brand)] font-bold text-xs">
                        {initials(user?.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`font-semibold text-sm truncate ${isActive ? "text-white" : "text-white/80"
                            }`}
                        >
                          {user?.name ?? "Unknown User"}
                        </span>
                        <span className="text-[10px] text-white/40 shrink-0 ml-1">
                          {room.lastMessage
                            ? formatTime(room.lastMessage.createdAt)
                            : ""}
                        </span>
                      </div>
                      <div className="text-xs text-white/50 truncate">
                        {preview}
                      </div>
                    </div>
                    {unread > 0 && !isActive && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white shadow-lg shrink-0">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>
                );
              })}

              {roomPagination && roomPage < roomPagination.totalPage && (
                <button
                  onClick={() => loadRooms(roomPage + 1)}
                  className="w-full py-3 text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors text-center"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── RIGHT PANEL: Chat Area ──────────────────────────────────────── */}
      <div className="col-span-9 rounded-xl border border-white/10 bg-white/5 flex flex-col overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        {activeRoom ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
              <Avatar className="h-10 w-10 ring-2 ring-[var(--brand)]/20">
                {activeRoom.user?.image && (
                  <AvatarImage
                    src={activeRoom.user.image}
                    alt={activeRoom.user.name}
                  />
                )}
                <AvatarFallback className="bg-[var(--brand)]/10 text-[var(--brand)]">
                  {initials(activeRoom.user?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-white">
                  {activeRoom.user?.name ?? "Unknown User"}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </div>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full w-full">
                <div className="p-6 flex flex-col gap-4">

                  {/* Load older button */}
                  {msgPagination && msgPage < msgPagination.totalPage && (
                    <div className="flex justify-center">
                      <button
                        onClick={loadOlderMessages}
                        disabled={loadingOlder}
                        className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {loadingOlder ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Load older messages
                      </button>
                    </div>
                  )}

                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      /**
                       * SINGLE SOURCE OF TRUTH FOR ALIGNMENT:
                       * senderRole === "admin"  →  isAdmin = true  →  RIGHT
                       * senderRole === "user"   →  isAdmin = false →  LEFT
                       *
                       * Every message in state has senderRole set correctly:
                       *  • REST load    → comes from DB with correct senderRole
                       *  • Admin send   → we explicitly set senderRole:"admin"
                       *  • Socket user  → server sets senderRole:"user"
                       *  • Socket admin → filtered out by adminIdRef check
                       */
                      // Use sender._id as ground truth — senderRole from
                      // the server can be stale or missing on some payloads.
                      const isAdmin =
                        !!adminIdRef.current &&
                        msg.sender?._id === adminIdRef.current;

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-2 ${isAdmin ? "justify-end" : "justify-start"
                            }`}
                        >
                          {/* User avatar — only on the LEFT */}
                          {!isAdmin && (
                            <Avatar className="h-7 w-7 shrink-0 self-end">
                              {msg.sender?.image && (
                                <AvatarImage src={msg.sender.image} />
                              )}
                              <AvatarFallback className="bg-white/10 text-[10px]">
                                {initials(msg.sender?.name ?? "U")}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className="max-w-[72%]">
                            {/* ── Text bubble */}
                            {msg.messageType === "text" && (
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isAdmin
                                  ? "bg-[var(--brand)] text-white rounded-br-sm shadow-lg shadow-[var(--brand)]/20"
                                  : "bg-white/10 text-white/90 rounded-bl-sm border border-white/5"
                                  }`}
                              >
                                {msg.content}
                              </div>
                            )}

                            {/* ── Image bubble */}
                            {msg.messageType === "image" && msg.fileUrl && (
                              <div
                                className={`rounded-2xl overflow-hidden border ${isAdmin
                                  ? "border-[var(--brand)]/30 rounded-br-sm"
                                  : "border-white/10 rounded-bl-sm"
                                  }`}
                              >
                                <img
                                  src={msg.fileUrl}
                                  alt="Attachment"
                                  className="max-w-[260px] max-h-[220px] object-cover block"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              </div>
                            )}

                            {/* ── PDF bubble */}
                            {msg.messageType === "pdf" && msg.fileUrl && (
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm hover:opacity-80 transition-opacity ${isAdmin
                                  ? "bg-[var(--brand)] text-white rounded-br-sm"
                                  : "bg-white/10 text-white/90 rounded-bl-sm border border-white/5"
                                  }`}
                              >
                                <FileText className="h-4 w-4 shrink-0" />
                                <span className="truncate max-w-[180px]">
                                  {msg.fileName ?? "Document.pdf"}
                                </span>
                              </a>
                            )}

                            {/* Timestamp */}
                            <div
                              className={`mt-1 text-[10px] text-white/40 px-1 ${isAdmin ? "text-right" : "text-left"
                                }`}
                            >
                              {formatTime(msg.createdAt)}
                            </div>
                          </div>

                          {/* Admin avatar — only on the RIGHT */}
                          {isAdmin && (
                            <Avatar className="h-7 w-7 shrink-0 self-end">
                              {activeRoom.admin?.image && (
                                <AvatarImage src={activeRoom.admin.image} />
                              )}
                              <AvatarFallback className="bg-[var(--brand)]/20 text-[var(--brand)] text-[10px]">
                                {initials(activeRoom.admin?.name ?? "A")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} className="h-2" />
                </div>
              </ScrollArea>
            </div>

            {/* Input bar */}
            <form
              onSubmit={sendText}
              className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) sendFile(file);
                  e.target.value = "";
                }}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/10 shrink-0"
                title="Attach image or PDF"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                {/* 👈 ADD THIS */}
                <Input
                  ref={inputRef}
                  placeholder="Type your reply…"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  // disabled={sending}
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--brand)]/50 transition-all h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="h-11 w-11 rounded-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white shadow-lg shadow-[var(--brand)]/20 disabled:opacity-50 transition-all flex items-center justify-center p-0 shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/30">
            <MessageSquareOff className="h-14 w-14" />
            <p className="text-sm">Select a conversation to start</p>
          </div>
        )}
      </div>
    </div>
  );
}
