"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Eye, Trash2 } from "lucide-react";
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
        <p className="text-sm text-white/60">Manage user access and subscription status.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            placeholder="Search users by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        <div className="rounded-md border border-white/10 bg-black/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                const planColor =
                  u.plan === "Premium"
                    ? "bg-blue-500/20 text-blue-300"
                    : u.plan === "Enterprise"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : u.plan === "Basic"
                    ? "bg-sky-500/20 text-sky-300"
                    : "bg-slate-500/20 text-slate-300";
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-white/60">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={planColor}>{u.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/20 text-emerald-300">
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.joined}</TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button size="icon" variant="ghost" onClick={() => setViewUser(u)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteUser(u)}>
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
              <Button variant="outline" className="bg-white/5 border-white/10 text-white">
                Previous
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="bg-white/5 border-white/10 text-white">
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
        <DialogContent className="bg-white/5 border-white/10 text-white">
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
