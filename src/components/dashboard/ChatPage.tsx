"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, SendHorizontal, MoreVertical } from "lucide-react";

const users = [
  {
    id: "1",
    name: "Alice Freeman",
    preview: "I have a question about my audit report.",
    time: "10:42 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Robert Smith",
    preview: "Thanks for the clarification!",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "3",
    name: "Sarah Jones",
    preview: "When will my tax return be processed?",
    time: "Feb 8",
    unread: 0,
  },
];

const initialLogs: Record<string, Array<{ author: "you" | "them"; text: string; time: string }>> = {
  "1": [
    {
      author: "them",
      text: "Hi, I need help accessing my Q4 report.",
      time: "10:30 AM",
    },
    {
      author: "you",
      text: "Hello Alice! I can certainly help with that. Are you seeing any error messages?",
      time: "10:32 AM",
    },
    {
      author: "them",
      text: 'It just says "Access Denied" when I click the download button.',
      time: "10:35 AM",
    },
    {
      author: "them",
      text: "I have a question about my audit report.",
      time: "10:42 AM",
    },
  ],
  "2": [
    {
      author: "them",
      text: "Thanks for the clarification!",
      time: "Yesterday",
    },
    {
      author: "you",
      text: "You're welcome Robert! Let me know if you need anything else.",
      time: "Yesterday",
    },
  ],
  "3": [
    {
      author: "them",
      text: "When will my tax return be processed?",
      time: "Feb 8",
    },
    {
      author: "you",
      text: "It's currently under review. Expected completion by Friday.",
      time: "Feb 8",
    },
  ],
};

export default function ChatPage() {
  const [active, setActive] = useState(users[0]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState(initialLogs);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs, active.id]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    const ts = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLogs((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] || []),
        { author: "you", text: message, time: ts },
      ],
    }));

    setMessage("");
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLog = logs[active.id] || [];

  return (
    <div className="grid grid-cols-12 h-[calc(100vh-180px)] min-h-[500px] gap-4">
      {/* Sidebar: User List */}
      <div className="col-span-3 rounded-xl border border-white/10 bg-white/5 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-lg font-semibold mb-3">Support Requests</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-[var(--brand)]"
            />
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col">
              {filteredUsers.map((u) => {
                const initials = u.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const isActive = active.id === u.id;

                return (
                  <button
                    key={u.id}
                    onClick={() => setActive(u)}
                    className={`w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-all border-l-2 ${isActive
                      ? "border-[var(--brand)] bg-white/10"
                      : "border-transparent hover:border-white/20"
                      }`}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-[var(--brand)] transition-all">
                      <AvatarFallback className="bg-white/10 text-[var(--brand)] font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-semibold text-sm truncate ${isActive ? "text-white" : "text-white/80"}`}>
                          {u.name}
                        </span>
                        <span className="text-[10px] text-white/40">{u.time}</span>
                      </div>
                      <div className="text-xs text-white/50 truncate">
                        {u.preview}
                      </div>
                    </div>
                    {u.unread > 0 && !isActive && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white shadow-lg shadow-[var(--brand)]/20">
                        {u.unread}
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-white/40 text-sm">
                  No conversations found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="col-span-9 rounded-xl border border-white/10 bg-white/5 flex flex-col overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <Avatar className="h-10 w-10 ring-2 ring-[var(--brand)]/20">
            <AvatarFallback className="bg-[var(--brand)]/10 text-[var(--brand)]">
              {active.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-white">{active.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full w-full">
            <div className="p-6 flex flex-col gap-4">
              {currentLog.map((m, i) => {
                const isYou = m.author === "you";
                return (
                  <div
                    key={i}
                    className={`flex ${isYou ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] ${isYou ? "order-1" : "order-2"}`}>
                      <div
                        className={`relative px-4 py-2.5 rounded-2xl text-sm ${isYou
                          ? "bg-[var(--brand)] text-white rounded-tr-none shadow-lg shadow-[var(--brand)]/10"
                          : "bg-white/10 text-white/90 rounded-tl-none border border-white/5"
                          }`}
                      >
                        {m.text}
                      </div>
                      <div
                        className={`mt-1.5 text-[10px] text-white/40 px-1 ${isYou ? "text-right" : "text-left"
                          }`}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <form
          onSubmit={send}
          className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-2"
        >
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--brand)]/50 transition-all pr-12 h-11"
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim()}
            className="h-11 w-11 rounded-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white shadow-lg shadow-[var(--brand)]/20 disabled:opacity-50 transition-all flex items-center justify-center p-0"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

