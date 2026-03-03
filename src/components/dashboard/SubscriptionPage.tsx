"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Check, Pencil, Copy, Trash2, Plus } from "lucide-react";

type Plan = {
  name: string;
  monthly: number;
  yearly: number;
  features: string[];
  active?: number;
};

const initialPlans: Plan[] = [
  {
    name: "Free Tier",
    monthly: 0,
    yearly: 0,
    active: 8450,
    features: [
      "Basic Audit Access",
      "1 User Profile",
      "View Only Mode",
      "Community Support",
    ],
  },
  {
    name: "Basic",
    monthly: 29,
    yearly: 290,
    active: 3240,
    features: [
      "Full Audit History",
      "5 User Profiles",
      "Export to PDF",
      "Email Support",
    ],
  },
  {
    name: "Premium",
    monthly: 99,
    yearly: 990,
    active: 1105,
    features: [
      "Unlimited Profiles",
      "Priority Audit Review",
      "API Access",
      "24/7 Phone Support",
      "Custom Branding",
    ],
  },
];

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("monthly");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletePlan, setDeletePlan] = useState<{
    plan: Plan;
    index: number;
  } | null>(null);
  const [draft, setDraft] = useState<Plan>({
    name: "",
    monthly: 0,
    yearly: 0,
    features: [""],
  });

  function addFeature() {
    setDraft((d) => ({ ...d, features: [...d.features, ""] }));
  }

  function updateFeature(i: number, v: string) {
    setDraft((d) => {
      const next = [...d.features];
      next[i] = v;
      return { ...d, features: next };
    });
  }

  function handleEdit(p: Plan, index: number) {
    setDraft(p);
    setEditingIndex(index);
    setOpen(true);
  }

  function savePlan(e: React.FormEvent) {
    e.preventDefault();
    if (editingIndex !== null) {
      setPlans((p) => {
        const next = [...p];
        next[editingIndex] = draft;
        return next;
      });
    } else {
      setPlans((p) => [...p, draft]);
    }
    setOpen(false);
    setEditingIndex(null);
    setDraft({ name: "", monthly: 0, yearly: 0, features: [""] });
  }

  function confirmDelete() {
    if (deletePlan !== null) {
      setPlans((p) => p.filter((_, i) => i !== deletePlan.index));
      setDeletePlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscription Plans</h1>
          <p className="text-sm text-white/60">
            Configure pricing tiers and features for your customers.
          </p>
        </div>
        <Button
          onClick={() => {
            setDraft({ name: "", monthly: 0, yearly: 0, features: [""] });
            setEditingIndex(null);
            setOpen(true);
          }}
          className="relative"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
          <span className="pointer-events-none absolute -top-3 -right-3 h-10 w-10 rounded-full bg-[var(--brand)]/30 blur-lg" />
        </Button>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-[#141f31] border border-white/10 p-1">
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
            >
              Yearly <span className="ml-1 text-emerald-400">-20%</span>
            </TabsTrigger>
          </TabsList>
        </div>
        {["monthly", "yearly"].map((key) => (
          <TabsContent key={key} value={key}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p, index) => (
                <Card key={p.name} className="bg-[#141f31] border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white/90">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white">
                      ${key === "monthly" ? p.monthly : p.yearly}
                      <span className="text-sm text-white/60 font-normal">
                        /month
                      </span>
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {p.active?.toLocaleString() ?? 0} active subscribers
                    </div>
                    <Separator className="my-4 bg-white/10" />
                    <ul className="text-sm space-y-2 text-white/80">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-sky-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
                      <Button
                        variant="premium"
                        size="sm"
                        onClick={() => handleEdit(p, index)}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white/60 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white/60 hover:text-white"
                          onClick={() => setDeletePlan({ plan: p, index })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="bg-[#141f31] border-dashed border-white/20 grid place-items-center">
                <button
                  onClick={() => {
                    setDraft({ name: "", monthly: 0, yearly: 0, features: [""] });
                    setEditingIndex(null);
                    setOpen(true);
                  }}
                  className="flex flex-col items-center gap-2 text-white/70 hover:text-white"
                >
                  <span className="h-12 w-12 rounded-full bg-white/5 grid place-items-center border border-white/10">
                    <Plus className="h-6 w-6" />
                  </span>
                  <div className="text-sm font-medium">Add New Plan</div>
                  <div className="text-xs">
                    Create a custom subscription tier
                  </div>
                </button>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingIndex(null);
        }}
      >
        <DialogContent className="bg-[#141f31]/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Plan" : "Create Plan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={savePlan} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm">Plan Name</label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Monthly Price</label>
                <Input
                  type="number"
                  value={draft.monthly}
                  onChange={(e) =>
                    setDraft({ ...draft, monthly: Number(e.target.value) })
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Yearly Price</label>
                <Input
                  type="number"
                  value={draft.yearly}
                  onChange={(e) =>
                    setDraft({ ...draft, yearly: Number(e.target.value) })
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Features</label>
              <div className="space-y-2">
                {draft.features.map((f, i) => (
                  <Input
                    key={i}
                    value={f}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    placeholder={`Feature ${i + 1}`}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
                  />
                ))}
              </div>
              <Button type="button" variant="premium" size="sm" className="w-full" onClick={addFeature}>
                Add Feature
              </Button>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="premium" type="submit">
                {editingIndex !== null ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletePlan} onOpenChange={() => setDeletePlan(null)}>
        <DialogContent className="bg-[#141f31]/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/60">
            Are you sure you want to delete the plan{" "}
            <span className="text-white font-medium">{deletePlan?.plan.name}</span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDeletePlan(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
