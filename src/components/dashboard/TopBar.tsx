"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Bell, Crown, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axiosSecure from "@/components/hook/axiosSecure";

export default function TopBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSaveProfile = async () => {
    setError("");
    setMessage("");

    if (!newPassword && !confirmPassword) {
      // Nothing to save or just pic
      setIsProfileOpen(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosSecure.post("/auth/change-password", {
        newPassword
      });

      if (res.data?.success || res.status === 200) {
        setMessage(res.data?.message || "Password updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setIsProfileOpen(false), 1500);
      } else {
        setError("Failed to update password.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/10  bg-[#121e33] sticky top-0 z-10">
        <div className="flex-1 max-w-2xl">
        </div>
        <div className="ml-4 flex items-center gap-6">
          <div className="relative cursor-pointer">
            <Bell className="w-5 h-5 text-white/80" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--brand)]" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">Will Ray</div>
                  <div className="text-xs text-[var(--brand)]">Super Admin</div>
                </div>
                <Avatar className="h-9 w-9 border border-white/10">
                  <AvatarFallback className="bg-white/10 text-xs shadow-[0_0_15px_rgba(var(--brand-rgb),0.5)]">WR</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#16253c] border-white/10 text-white">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[var(--brand)]" />
                <span>Premium Access</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={() => setIsProfileOpen(true)}
                className="focus:bg-white/10 cursor-pointer gap-2"
              >
                <User className="w-4 h-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer gap-2">
                <Settings className="w-4 h-4" />
                Manage Subscription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="bg-[#121e33] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription className="text-white/60">
              Update your premium account profile picture and password here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-2 border-[var(--brand)]">
                <AvatarFallback className="bg-white/10 text-2xl shadow-[0_0_15px_rgba(var(--brand-rgb),0.5)]">WR</AvatarFallback>
              </Avatar>
              <Button variant="outline" className="h-8 border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white">
                Change Picture
              </Button>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white/80">New Password</label>
              <Input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password" 
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white/80">Confirm Password</label>
              <Input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password" 
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40" 
              />
            </div>
          </div>
          
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {message && <div className="text-green-500 text-sm">{message}</div>}

          <div className="flex justify-end gap-3 pb-2">
            <Button variant="ghost" onClick={() => setIsProfileOpen(false)} className="hover:bg-white/10 text-white hover:text-white">Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={loading} className="bg-[var(--brand)] hover:brightness-110 text-white">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
