"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, SendHorizontal } from "lucide-react";

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

export default function ChatPage() {
  const [active, setActive] = useState(users[0]);
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<
    Array<{ author: "you" | "them"; text: string; time: string }>
  >([
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
  ]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!message) return;
    const ts = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLog((l) => [...l, { author: "you", text: message, time: ts }]);
    setMessage("");
  }

  return (
    <div className="grid grid-cols-12 h-[70vh] gap-4">
      <div className="col-span-3 rounded-xl border border-white/10 bg-white/5 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="text-lg font-semibold">Support Requests</div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {users.map((u) => {
            const initials = u.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const activeStyle =
              active.id === u.id ? "ring-1 ring-[var(--brand)] bg-white/5" : "";
            return (
              <button
                key={u.id}
                onClick={() => setActive(u)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${activeStyle}`}
              >
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-white/60">{u.time}</span>
                  </div>
                  <div className="text-xs text-white/60 truncate">
                    {u.preview}
                  </div>
                </div>
                {u.unread > 0 ? (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand)] text-[11px]">
                    {u.unread}
                  </span>
                ) : null}
              </button>
            );
          })}
        </ScrollArea>
      </div>
      <div className="col-span-9 rounded-xl border border-white/10 bg-white/5 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {active.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{active.name}</div>
            <div className="text-xs text-emerald-400">● Online</div>
          </div>
          <div className="ml-auto text-white/60">⋮</div>
        </div>
        <ScrollArea className="flex-1 p-6 space-y-4">
          {log.map((m, i) => {
            const isYou = m.author === "you";
            return (
              <div
                key={i}
                className={`max-w-[70%] ${isYou ? "ml-auto text-right" : ""}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-xl ${isYou ? "bg-[var(--brand)] text-white" : "bg-white/10 text-white/90"}`}
                >
                  {m.text}
                </div>
                <div
                  className={`mt-1 text-[10px] text-white/60 ${isYou ? "" : ""}`}
                >
                  {m.time}
                </div>
              </div>
            );
          })}
        </ScrollArea>
        <form
          onSubmit={send}
          className="p-4 border-t border-white/10 flex items-center gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
          <Button type="submit" className="px-3">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
