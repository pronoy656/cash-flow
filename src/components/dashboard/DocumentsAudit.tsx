"use client";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UploadCloud,
  Search as SearchIcon,
  Eye,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  CalendarDays,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axiosSecure from "@/components/hook/axiosSecure";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Notice = {
  _id: string;
  id: string;
  type: string;
  document: string;
  createdAt: string;
  updatedAt: string;
};

export default function DocumentsAudit() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<Notice | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("IRS Notice");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get("/notices");
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("type", uploadType);
    formData.append("document", file);

    try {
      setUploading(true);
      const res = await axiosSecure.post("/notices", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        toast.success("Document uploaded successfully");
        fetchNotices();
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await axiosSecure.delete(`/notices/${deletingId}`);
      if (res.data.success) {
        toast.success("Document deleted successfully");
        setNotices(notices.filter((n) => n._id !== deletingId));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "document.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = notices.filter((d) => {
    const q = query.toLowerCase();
    const type = d.type.toLowerCase();
    const name = d.document.split("/").pop()?.toLowerCase() || "";
    const date = new Date(d.createdAt).toLocaleDateString().toLowerCase();

    const match = name.includes(q) || type.includes(q) || date.includes(q);
    if (!match) return false;
    if (tab === "all") return true;
    if (tab === "irs") return d.type === "IRS Notice";
    if (tab === "case") return d.type === "Case Status";
    return true;
  });

  function FileIconByName(filename: string) {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf"))
      return <FileText className="h-5 w-5 text-rose-400" />;
    if (lower.endsWith(".doc") || lower.endsWith(".docx"))
      return <FileText className="h-5 w-5 text-sky-400" />;
    if (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png")
    )
      return <ImageIcon className="h-5 w-5 text-indigo-300" />;
    return <FileIcon className="h-5 w-5 text-slate-300" />;
  }

  const getFileName = (url: string) => {
    return url.split("/").pop() || "Document";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Document Management</h1>
        <p className="text-sm text-white/60">
          Central repository for IRS notices, case files, and reports.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-[#141f31] border border-white/10 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
            >
              All Documents
            </TabsTrigger>
            <TabsTrigger
              value="irs"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
            >
              IRS Notices
            </TabsTrigger>
            <TabsTrigger
              value="case"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
            >
              Case Files
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-[#141f31] p-6 shadow-sm">
          <div className="border-2 border-dashed border-white/10 rounded-lg p-10 text-center bg-white/5 hover:bg-white/[0.07] transition-colors">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              {uploading ? (
                <Loader2 className="h-6 w-6 text-white/70 animate-spin" />
              ) : (
                <UploadCloud className="h-6 w-6 text-white/70" />
              )}
            </div>
            <div className="text-lg font-medium">Upload New Documents</div>
            <p className="text-xs text-white/60 mb-4">
              Select document type and click to browse
            </p>
            <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#141f31] border-white/10 text-white">
                  <SelectItem value="IRS Notice">IRS Notice</SelectItem>
                  <SelectItem value="Case Status">Case Status</SelectItem>
                  <SelectItem value="Report">Report</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="premium"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Select Files"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleUpload}
                accept=".pdf,.jpg,.jpeg,.png,.docx"
              />
            </div>
            <p className="text-xs text-white/40 mt-3">
              Supported formats: PDF, JPG, PNG, DOCX (Max 25MB)
            </p>
          </div>
        </div>
      </Tabs>

      <div className="rounded-xl border border-white/10 bg-[#141f31] overflow-hidden">
        <div className="flex items-center justify-start p-4 border-b border-white/5 bg-white/5">
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Filter files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </div>
        <Table>
          <TableHeader className="[&_tr]:border-white/5">
            <TableRow>
              <TableHead className="text-white py-5">
                Document Name
              </TableHead>
              <TableHead className="text-white py-5">Type</TableHead>
              <TableHead className="text-white py-5">
                Date Uploaded
              </TableHead>
              <TableHead className="text-white py-5 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-white/20" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-white/40">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow
                  key={d._id}
                  className="border-white/5 hover:bg-white/5 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {FileIconByName(getFileName(d.document))}
                      <div>
                        <div className="font-medium text-white/90">
                          {getFileName(d.document)}
                        </div>
                        <div className="text-xs text-white/50">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/70">{d.type}</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2 text-white/70">
                      <CalendarDays className="h-4 w-4 text-white/40" />
                      {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setView(d)}
                      className="text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        handleDownload(d.document, getFileName(d.document))
                      }
                      className="text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(d._id)}
                      className="text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent className="bg-[#141f31]/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          {view ? (
            <div className="text-sm space-y-4">
              <div className="aspect-square w-full rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                {view.document.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={view.document}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={view.document}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-white/60 font-medium">Name:</span>{" "}
                  {getFileName(view.document)}
                </p>
                <p>
                  <span className="text-white/60 font-medium">Type:</span>{" "}
                  {view.type}
                </p>
                <p>
                  <span className="text-white/60 font-medium">Uploaded:</span>{" "}
                  {new Date(view.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                className="w-full"
                variant="premium"
                onClick={() =>
                  handleDownload(view.document, getFileName(view.document))
                }
              >
                Download Document
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#141f31] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-white/70">
            Are you sure you want to delete this document? This action cannot be
            undone.
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-white/60 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
