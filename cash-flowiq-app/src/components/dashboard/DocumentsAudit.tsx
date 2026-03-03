"use client";
import { useState } from "react";
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

type Doc = {
  id: string;
  name: string;
  type: "IRS Notice" | "Case File" | "Report" | "Other";
  date: string;
  size: string;
};

const docs: Doc[] = [
  {
    id: "1",
    name: "IRS_Notice_CP2000.pdf",
    type: "IRS Notice",
    date: "2026-02-08",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Case_Status_Update_v2.docx",
    type: "Case File",
    date: "2026-02-07",
    size: "1.1 MB",
  },
  {
    id: "3",
    name: "Audit_Report_Q4_2025.pdf",
    type: "Report",
    date: "2026-02-05",
    size: "4.8 MB",
  },
  {
    id: "4",
    name: "Tax_Return_2024.pdf",
    type: "IRS Notice",
    date: "2026-02-01",
    size: "3.2 MB",
  },
  {
    id: "5",
    name: "Evidence_Photo_001.jpg",
    type: "Case File",
    date: "2026-01-29",
    size: "4.5 MB",
  },
];

export default function DocumentsAudit() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<Doc | null>(null);

  const filtered = docs.filter((d) => {
    const q = query.toLowerCase();
    const match =
      d.name.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.date.includes(q);
    if (!match) return false;
    if (tab === "all") return true;
    if (tab === "irs") return d.type === "IRS Notice";
    if (tab === "case") return d.type === "Case File";
    return true;
  });
  const rows = filtered;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Document Management</h1>
        <p className="text-sm text-white/60">
          Central repository for IRS notices, case files, and reports.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="irs">IRS Notice</TabsTrigger>
          <TabsTrigger value="case">Case File</TabsTrigger>
        </TabsList>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-10 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <UploadCloud className="h-6 w-6 text-white/70" />
            </div>
            <div className="text-lg font-medium">Upload New Documents</div>
            <p className="text-xs text-white/60 mb-4">
              Drag and drop your files here, or click to browse
            </p>
            <Button>Select Files</Button>
            <p className="text-xs text-white/40 mt-3">
              Supported formats: PDF, JPG, PNG, DOCX (Max 25MB)
            </p>
          </div>
        </div>
        <TabsContent value="all" />
        <TabsContent value="irs" />
        <TabsContent value="case" />
      </Tabs>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-end p-4">
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
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {FileIconByName(d.name)}
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-white/60">{d.size}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{d.type}</TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-white/60" />
                    {d.date}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setView(d)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent className="bg-white/5 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          {view ? (
            <div className="text-sm">
              <p>Name: {view.name}</p>
              <p>Type: {view.type}</p>
              <p>Date: {view.date}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
