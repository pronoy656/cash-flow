"use client";
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axiosSecure from "@/components/hook/axiosSecure";
import { toast } from "sonner";
import { Loader2, Trash2, FileText, Shield, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type LegalDoc = {
  _id: string;
  title: string;
  description: string;
  updatedAt?: string;
};

type ApiState = {
  doc: LegalDoc | null;
  title: string;
  desc: string;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  confirmDelete: boolean;
};

const INITIAL_STATE: ApiState = {
  doc: null,
  title: "",
  desc: "",
  loading: false,
  saving: false,
  deleting: false,
  confirmDelete: false,
};

const CONFIG = {
  terms: {
    endpoint: "/terms-and-conditions",
    label: "Terms & Conditions",
    icon: FileText,
  },
  privacy: {
    endpoint: "/privacy-policy",
    label: "Privacy Policy",
    icon: Shield,
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LegalContent() {
  const [tab, setTab] = useState<"terms" | "privacy">("terms");
  const [state, setState] = useState<Record<"terms" | "privacy", ApiState>>({
    terms: { ...INITIAL_STATE },
    privacy: { ...INITIAL_STATE },
  });

  // ── Helpers for local state update ─────────────────────────────────────────

  const updateState = useCallback((key: "terms" | "privacy", patch: Partial<ApiState>) => {
    setState((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }, []);

  // ── Fetch Logic ────────────────────────────────────────────────────────────

  const fetchDoc = useCallback(async (key: "terms" | "privacy") => {
    updateState(key, { loading: true });
    try {
      const res = await axiosSecure.get(CONFIG[key].endpoint);
      const docs: LegalDoc[] = res.data?.data ?? [];
      const doc = docs[0] || null;
      updateState(key, {
        doc,
        title: doc?.title || "",
        desc: doc?.description || "",
      });
    } catch (err) {
      toast.error(`Failed to load ${CONFIG[key].label}`);
    } finally {
      updateState(key, { loading: false });
    }
  }, [updateState]);

  useEffect(() => {
    fetchDoc("terms");
    fetchDoc("privacy");
  }, [fetchDoc]);

  // ── Save Logic ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const key = tab;
    const current = state[key];
    const { title, desc, doc } = current;

    if (!title.trim() || !desc.trim()) {
      toast.error("Both title and description are required.");
      return;
    }

    updateState(key, { saving: true });
    try {
      const payload = { title: title.trim(), description: desc.trim() };
      const url = CONFIG[key].endpoint;

      if (doc?._id) {
        // Update existing
        const res = await axiosSecure.patch(`${url}/${doc._id}`, payload);
        toast.success(`${CONFIG[key].label} updated successfully.`);
        const updatedDoc = res.data?.data || doc;
        updateState(key, { doc: updatedDoc, title: updatedDoc.title, desc: updatedDoc.description });
      } else {
        // Create new
        const res = await axiosSecure.post(url, payload);
        toast.success(`${CONFIG[key].label} created successfully.`);
        const newDoc = res.data?.data || null;
        updateState(key, { doc: newDoc, title: newDoc?.title || title, desc: newDoc?.description || desc });
      }
      // Refresh to ensure we have IDs etc correctly
      fetchDoc(key);
    } catch (err: any) {
      const msg = err.response?.data?.message || `Failed to save ${CONFIG[key].label}`;
      toast.error(msg);
    } finally {
      updateState(key, { saving: false });
    }
  };

  // ── Delete Logic ───────────────────────────────────────────────────────────

  const handleDelete = async () => {
    const key = tab;
    const docId = state[key].doc?._id;
    if (!docId) return;

    updateState(key, { deleting: true });
    try {
      await axiosSecure.delete(`${CONFIG[key].endpoint}/${docId}`);
      toast.success(`${CONFIG[key].label} deleted successfully.`);
      updateState(key, {
        doc: null,
        title: "",
        desc: "",
        confirmDelete: false,
      });
    } catch (err: any) {
      toast.error(`Failed to delete ${CONFIG[key].label}`);
    } finally {
      updateState(key, { deleting: false });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const active = state[tab];
  const activeConfig = CONFIG[tab];
  const Icon = activeConfig.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Legal Content</h1>
          <p className="text-sm text-white/50 mt-1">
            Manage your application's legal documents.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchDoc(tab)}
          disabled={active.loading || active.saving}
          className="text-white/50 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${active.loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <div className="flex justify-center mb-6">
          <TabsList className="bg-[#141f31] border border-white/10 p-1">
            <TabsTrigger
              value="terms"
              className="flex items-center gap-2 px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50"
            >
              <FileText className="h-4 w-4" /> Terms &amp; Conditions
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex items-center gap-2 px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50"
            >
              <Shield className="h-4 w-4" /> Privacy Policy
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <Card className="bg-white/5 border-white/10 overflow-hidden">
        <CardContent className="pt-6 space-y-6">
          {active.loading && !active.doc ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 rounded-md bg-white/5 w-1/3" />
              <div className="h-64 rounded-md bg-white/5 w-full" />
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium underline underline-offset-4 decoration-white/20">
                    {activeConfig.label}
                  </span>
                </div>
                {active.doc?.updatedAt && (
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">
                    Last sync: {new Date(active.doc.updatedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Title Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40 uppercase tracking-tighter">
                  Document Title
                </label>
                <Input
                  value={active.title}
                  onChange={(e) => updateState(tab, { title: e.target.value })}
                  placeholder={`e.g. ${activeConfig.label}`}
                  disabled={active.saving || active.loading}
                  className="bg-black/30 border-white/10 text-white placeholder:text-white/20 h-11 focus-visible:ring-indigo-500/50"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40 uppercase tracking-tighter">
                  Content / Description
                </label>
                <Textarea
                  value={active.desc}
                  onChange={(e) => updateState(tab, { desc: e.target.value })}
                  placeholder="Enter the document content here..."
                  disabled={active.saving || active.loading}
                  className="min-h-[300px] bg-black/40 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-indigo-500/50 resize-y"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                {active.doc ? (
                  <Button
                    variant="ghost"
                    onClick={() => updateState(tab, { confirmDelete: true })}
                    disabled={active.saving || active.loading}
                    className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Document
                  </Button>
                ) : (
                  <div className="text-amber-400/50 text-xs italic">
                    * No existing {activeConfig.label} found.
                  </div>
                )}

                <Button
                  variant="premium"
                  onClick={handleSave}
                  disabled={active.saving || active.loading}
                  className="min-w-[140px]"
                >
                  {active.saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : active.doc ? (
                    "Update Changes"
                  ) : (
                    "Create & Save"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reusable Delete Dialog */}
      <Dialog
        open={active.confirmDelete}
        onOpenChange={(open) => updateState(tab, { confirmDelete: open })}
      >
        <DialogContent className="bg-[#141f31] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete {activeConfig.label}?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-white/60 text-sm">
            This action will permanently remove this document from the database. It cannot be recovered.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => updateState(tab, { confirmDelete: false })}
              className="text-white/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={active.deleting}
            >
              {active.deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
