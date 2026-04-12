"use client";
import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosSecure from "@/components/hook/axiosSecure";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type User = {
  _id: string;
  name: string;
  email: string;
  plan: string;
  status: "active" | "block" | string;
  createdAt: string;
  image?: string;
};

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get(`/user?page=${page}&limit=10`);
      if (res.data?.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination?.totalPage || 1);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "block" : "active";
    try {
      // Optimistically update
      setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
      // API call to update status using admin endpoint
      await axiosSecure.patch(`/admin/update-user/${user._id}`, {
        status: newStatus
      });
      toast.success(`User status updated to ${newStatus}`);
    } catch (err: any) {
      console.error("Failed to update status", err);
      toast.error(err.response?.data?.message || "Failed to update user status");
      // Revert on failure
      setUsers(users.map(u => u._id === user._id ? { ...u, status: user.status } : u));
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await axiosSecure.delete(`/admin/delete-account/${deleteUser._id}`);
      setUsers(users.filter(u => u._id !== deleteUser._id));
      setDeleteUser(null);
      toast.success("User deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete user", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)),
    );
  }, [query, users]);

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
                ? u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
                : "U";
              const planStyles =
                u.plan === "Premium"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : u.plan === "Enterprise"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : u.plan === "Basic"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-slate-500/10 text-slate-400 border-white/10";
              const isActive = u.status === "active";
              
              return (
                <TableRow
                  key={u._id}
                  className="border-white/5 hover:bg-white/5 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-white/10">
                        {u.image && <AvatarImage src={u.image} alt={u.name} />}
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
                      {u.plan || "Free"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleToggleStatus(u)}>
                      <Switch checked={isActive} />
                      <span className={cn("text-sm font-medium transition-colors", isActive ? "text-emerald-400" : "text-white/40")}>
                        {isActive ? "Active" : "Blocked"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
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
            Showing {rows.length} users (Page {page} of {totalPages})
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="bg-white/5 border-white/10 text-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
                {new Date(viewUser.createdAt).toLocaleDateString()}
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
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
