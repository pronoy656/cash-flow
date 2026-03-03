"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type User = {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Basic" | "Premium" | "Enterprise";
  status: "Active" | "Suspended";
  joined: string;
};

const data: User[] = [
  {
    id: "1",
    name: "Jane Cooper",
    email: "jane@example.com",
    plan: "Premium",
    status: "Active",
    joined: "2025-09-01",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    plan: "Basic",
    status: "Active",
    joined: "2025-07-12",
  },
  {
    id: "3",
    name: "Lisa Frank",
    email: "lisa@example.com",
    plan: "Free",
    status: "Suspended",
    joined: "2025-04-18",
  },
];

export default function UsersTable() {
  const [query, setQuery] = useState("");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-white/60">
          Manage user access and subscription status.
        </p>
      </div>

      <div className="mb-4 relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
        <Input
          placeholder="Search users by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      <div className="rounded-md border border-white/10 bg-[#141F31] overflow-hidden">
        <Table>
          <TableHeader className="[&_tr]:border-white/5">
            <TableRow>
              <TableHead className="text-white py-5">User</TableHead>
              <TableHead className="text-white py-5">Plan</TableHead>
              <TableHead className="text-white py-5">Status</TableHead>
              <TableHead className="text-white py-5">Joined</TableHead>
              <TableHead className="text-right text-white py-5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => {
              const initials = u.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const planStyles =
                u.plan === "Premium"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : u.plan === "Enterprise"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : u.plan === "Basic"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-slate-500/10 text-slate-400 border-white/10";
              return (
                <TableRow
                  key={u.id}
                  className="border-white/5 hover:bg-white/5 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-white/10">
                        <AvatarFallback className="bg-white/5 text-xs text-white/70">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-medium text-white/90">{u.name}</div>
                        <div className="text-xs text-white/50">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-medium px-2.5 py-0.5 rounded-md", planStyles)}>
                      {u.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2 group cursor-default">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </div>
                      <span className="text-sm font-medium text-emerald-400/90 group-hover:text-emerald-400 transition-colors">
                        {u.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">{u.joined}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setViewUser(u)}
                      className="text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteUser(u)}
                      className="text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-white/70 border-t border-white/10">
          <span>
            Showing 1-{rows.length} of {data.length} users
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="bg-[#141f31]/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewUser ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span>{" "}
                {viewUser.name}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                {viewUser.email}
              </p>
              <p>
                <span className="text-muted-foreground">Plan:</span>{" "}
                {viewUser.plan}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                {viewUser.status}
              </p>
              <p>
                <span className="text-muted-foreground">Joined:</span>{" "}
                {viewUser.joined}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setViewUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent className="bg-[#141f31]/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {deleteUser?.name}? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteUser(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
