"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalContent() {
  const [tab, setTab] = useState("terms");
  const [terms, setTerms] = useState(`# 1. Introduction
Welcome to CashFlowIQ. By accessing our platform, you agree to these terms.

## 2. Service Usage
* Provide accurate account information.
* Maintain the confidentiality of your account.
* Unauthorized use is prohibited.`);
  const [privacy, setPrivacy] = useState(`# 1. Data Collection
We collect usage data to improve the service.

## 2. Data Usage
* We do not sell personal data.
* You may request deletion of your data at any time.`);

  function save() {
    // no-op mock
    alert("Content saved");
  }

  function surround(
    editor: "terms" | "privacy",
    before: string,
    after: string = "",
  ) {
    const get = editor === "terms" ? terms : privacy;
    const set = editor === "terms" ? setTerms : setPrivacy;
    set(`${before}${get}${after}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Legal Content</h1>
        <p className="text-sm text-white/60">
          Manage Terms of Service and Privacy Policy documents.
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button className="relative">
          <span className="mr-2">💾</span> Save Changes
          <span className="pointer-events-none absolute -top-3 -right-3 h-10 w-10 rounded-full bg-[var(--brand)]/30 blur-lg" />
        </Button>
      </div>
      {tab === "terms" ? (
        <EditorPanel
          title="Terms & Conditions"
          value={terms}
          onChange={setTerms}
          onBold={() => surround("terms", "**", "**")}
          onItalic={() => surround("terms", "_", "_")}
          onUnderline={() => surround("terms", "<u>", "</u>")}
          onH1={() => surround("terms", "# ")}
          onH2={() => surround("terms", "## ")}
          onList={() => surround("terms", "* ")}
          onSave={save}
        />
      ) : (
        <EditorPanel
          title="Privacy Policy"
          value={privacy}
          onChange={setPrivacy}
          onBold={() => surround("privacy", "**", "**")}
          onItalic={() => surround("privacy", "_", "_")}
          onUnderline={() => surround("privacy", "<u>", "</u>")}
          onH1={() => surround("privacy", "# ")}
          onH2={() => surround("privacy", "## ")}
          onList={() => surround("privacy", "* ")}
          onSave={save}
        />
      )}
    </div>
  );
}

function EditorPanel({
  title,
  value,
  onChange,
  onBold,
  onItalic,
  onUnderline,
  onH1,
  onH2,
  onList,
  onSave,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onH1: () => void;
  onH2: () => void;
  onList: () => void;
  onSave: () => void;
}) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-3 py-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/60">Formatting</span>
            <button
              onClick={onBold}
              className="hover:text-white/90 text-white/70"
            >
              B
            </button>
            <button
              onClick={onItalic}
              className="hover:text-white/90 text-white/70 italic"
            >
              I
            </button>
            <button
              onClick={onUnderline}
              className="hover:text-white/90 text-white/70 underline"
            >
              U
            </button>
            <button
              onClick={onH1}
              className="hover:text-white/90 text-white/70"
            >
              H1
            </button>
            <button
              onClick={onH2}
              className="hover:text-white/90 text-white/70"
            >
              H2
            </button>
            <button
              onClick={onList}
              className="hover:text-white/90 text-white/70"
            >
              List
            </button>
          </div>
          <Button size="sm" onClick={onSave} className="bg-[var(--brand)]">
            Save Changes
          </Button>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[420px] font-mono text-sm bg-black/30 border-white/10"
        />
      </CardContent>
    </Card>
  );
}
