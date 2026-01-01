import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { useFlow, FlowQuestion } from "@/hooks/useFlow";
import { useProfile } from "@/hooks/useProfile";

import {
  MessageSquare,
  Plus,
  GripVertical,
  Trash2,
  Save,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Settings2,
  Code2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Number" },
  { value: "select", label: "Dropdown Select" },
  { value: "textarea", label: "Long Text" },
] as const;

type FieldType = (typeof fieldTypes)[number]["value"];

// ✅ unicode-safe base64 encode (browser)
function utf8ToB64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export default function FlowBuilder() {
  const {
    flow,
    flowLoading,
    questions,
    questionsLoading,
    updateFlow,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  } = useFlow();

  const { profile } = useProfile();

  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [gdprEnabled, setGdprEnabled] = useState(true);
  const [gdprText, setGdprText] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [optionsInput, setOptionsInput] = useState("");

  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    field_name: "",
    field_type: "text" as FieldType,
    is_required: true,
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [snippetOpen, setSnippetOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // fill local state when flow loads
  useEffect(() => {
    if (!flow) return;
    setWelcomeMessage(flow.welcome_message || "");
    setConfirmationMessage(flow.confirmation_message || "");
    setGdprEnabled(flow.gdpr_enabled ?? true);
    setGdprText(flow.gdpr_text || "");
  }, [flow]);

  // Share link (for your own testing / users)
  const widgetUrl = useMemo(() => {
    if (!flow?.is_published) return "";
    // keep consistent with your current route structure
    return `${window.location.origin}/chat/${flow.user_id}`;
  }, [flow?.is_published, flow?.user_id]);

  // ✅ NEW: self-contained snippet for embed.js + EmbedChat (/embed#...)
  const embedSnippet = useMemo(() => {
    if (!flow?.is_published) return "";

    const cfg = {
      flow: {
        id: flow.id,
        user_id: flow.user_id,
        welcome_message: welcomeMessage || flow.welcome_message || "",
        confirmation_message: confirmationMessage || flow.confirmation_message || "",
        gdpr_enabled: gdprEnabled ?? true,
        gdpr_text: gdprText || flow.gdpr_text || "",
      },
      questions: (questions || []).map((q) => ({
        id: q.id,
        question_text: q.question_text,
        field_name: q.field_name,
        field_type: q.field_type,
        is_required: q.is_required,
        options: q.options ?? null,
        order_index: q.order_index,
      })),
      profile: {
        business_name: profile?.business_name ?? null,
        accent_color: profile?.accent_color ?? null,
      },
    };

    const b64 = utf8ToB64(JSON.stringify(cfg));

    // cache bust parameter can be increased when you change embed.js
    return `<script src="${window.location.origin}/embed.js?v=1" data-config="${b64}"></script>`;
  }, [
    flow?.is_published,
    flow?.id,
    flow?.user_id,
    flow?.welcome_message,
    flow?.confirmation_message,
    flow?.gdpr_text,
    welcomeMessage,
    confirmationMessage,
    gdprEnabled,
    gdprText,
    questions,
    profile?.business_name,
    profile?.accent_color,
  ]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async () => {
    if (!widgetUrl) return;
    const ok = await copyToClipboard(widgetUrl);
    if (!ok) return toast.error("Copy failed");
    setCopiedLink(true);
    toast.success("Link copied");
    setTimeout(() => setCopiedLink(false), 1500);
  };

  const handleCopySnippet = async () => {
    if (!embedSnippet) return;
    const ok = await copyToClipboard(embedSnippet);
    if (!ok) return toast.error("Copy failed");
    setCopiedSnippet(true);
    toast.success("Snippet copied");
    setTimeout(() => setCopiedSnippet(false), 1500);
  };

  const handleSaveFlow = () => {
    if (!flow) return;
    updateFlow.mutate({
      welcome_message: welcomeMessage,
      confirmation_message: confirmationMessage,
      gdpr_enabled: gdprEnabled,
      gdpr_text: gdprText,
    });
  };

  const handlePublishToggle = () => {
    if (!flow) return;
    updateFlow.mutate({ is_published: !flow.is_published });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question_text.trim() || !newQuestion.field_name.trim()) {
      toast.error("Please fill in Question Text and Field Name");
      return;
    }

    const options =
      newQuestion.field_type === "select"
        ? optionsInput
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : null;

    addQuestion.mutate({
      question_text: newQuestion.question_text.trim(),
      field_name: newQuestion.field_name.trim().toLowerCase().replace(/\s+/g, "_"),
      field_type: newQuestion.field_type,
      is_required: newQuestion.is_required,
      options,
      order_index: questions.length,
    });

    setNewQuestion({ question_text: "", field_name: "", field_type: "text", is_required: true });
    setOptionsInput("");
    setIsAddDialogOpen(false);
  };

  if (flowLoading) {
    return (
      <DashboardLayout title="Flow Builder">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Flow Builder">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Messages
              </CardTitle>
              <CardDescription>Customize the messages your chatbot displays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Confirmation Message</Label>
                <Textarea
                  value={confirmationMessage}
                  onChange={(e) => setConfirmationMessage(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add questions to collect information from leads</CardDescription>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-primary">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Question
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>Create a new question to ask your leads</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Input
                        value={newQuestion.question_text}
                        onChange={(e) => setNewQuestion((q) => ({ ...q, question_text: e.target.value }))}
                        placeholder="What's your name?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Field Name</Label>
                      <Input
                        value={newQuestion.field_name}
                        onChange={(e) => setNewQuestion((q) => ({ ...q, field_name: e.target.value }))}
                        placeholder="name"
                      />
                      <p className="text-xs text-muted-foreground">Used internally (lowercase + underscores).</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={newQuestion.field_type}
                        onValueChange={(v) => setNewQuestion((q) => ({ ...q, field_type: v as FieldType }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newQuestion.field_type === "select" && (
                      <div className="space-y-2">
                        <Label>Options (comma-separated)</Label>
                        <Input
                          value={optionsInput}
                          onChange={(e) => setOptionsInput(e.target.value)}
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newQuestion.is_required}
                        onCheckedChange={(v) => setNewQuestion((q) => ({ ...q, is_required: v }))}
                      />
                      <Label>Required field</Label>
                    </div>

                    <Button onClick={handleAddQuestion} className="w-full gradient-primary">
                      Add Question
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {questionsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No questions added yet</p>
                  <p className="text-sm">Add questions to collect lead information</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q) => (
                    <QuestionItem
                      key={q.id}
                      question={q}
                      onUpdate={(updates) => updateQuestion.mutate({ id: q.id, ...updates })}
                      onDelete={() => deleteQuestion.mutate(q.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* GDPR */}
          <Card>
            <CardHeader>
              <CardTitle>GDPR Consent</CardTitle>
              <CardDescription>Add a consent checkbox for data collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch checked={gdprEnabled} onCheckedChange={setGdprEnabled} />
                <Label>Enable GDPR consent checkbox</Label>
              </div>

              {gdprEnabled && (
                <div className="space-y-2">
                  <Label>Consent Text</Label>
                  <Textarea value={gdprText} onChange={(e) => setGdprText(e.target.value)} rows={2} />
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSaveFlow} disabled={updateFlow.isPending} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish card */}
          <Card className={flow?.is_published ? "border-green-500/50 bg-green-500/5" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Status</CardTitle>
                <Badge variant={flow?.is_published ? "default" : "secondary"}>
                  {flow?.is_published ? "Live" : "Draft"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {flow?.is_published
                  ? "Your chatbot is live and collecting leads."
                  : "Publish your chatbot to start collecting leads."}
              </p>

              <Button
                onClick={handlePublishToggle}
                disabled={updateFlow.isPending}
                variant={flow?.is_published ? "outline" : "default"}
                className={!flow?.is_published ? "w-full gradient-primary" : "w-full"}
              >
                <Eye className="w-4 h-4 mr-2" />
                {flow?.is_published ? "Unpublish" : "Publish Chatbot"}
              </Button>
            </CardContent>
          </Card>

          {/* Share link + snippet */}
          {flow?.is_published && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share & Embed</CardTitle>
                <CardDescription>Share your chatbot link or embed it on your website</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Share link */}
                <div className="space-y-2">
                  <Label>Share link</Label>
                  <div className="flex gap-2">
                    <Input value={widgetUrl} readOnly className="text-xs" />
                    <Button size="icon" variant="outline" onClick={handleCopyLink} disabled={!widgetUrl}>
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Chatbot
                    </a>
                  </Button>
                </div>

                {/* Get snippet */}
                <Dialog open={snippetOpen} onOpenChange={setSnippetOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Code2 className="w-4 h-4 mr-2" />
                      Get snippet
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Embed snippet</DialogTitle>
                      <DialogDescription>
                        Copy and paste this into your website (WordPress / HTML).
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <pre className="text-xs whitespace-pre-wrap break-words">{embedSnippet}</pre>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          Tip: if you update embed.js, change <span className="font-mono">?v=1</span> to{" "}
                          <span className="font-mono">?v=2</span> etc. (cache).
                        </p>

                        <Button onClick={handleCopySnippet} disabled={!embedSnippet}>
                          {copiedSnippet ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy snippet
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-xl p-4 text-white text-sm"
                style={{ backgroundColor: profile?.accent_color || "#84cc16" }}
              >
                <p className="font-medium mb-2">{profile?.business_name || "Your Business"}</p>
                <p className="opacity-90">{welcomeMessage || flow?.welcome_message || "Hi! 👋"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuestionItem({
  question,
  onUpdate,
  onDelete,
}: {
  question: FlowQuestion;
  onUpdate: (updates: Partial<FlowQuestion>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{question.question_text}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {question.field_type}
          </Badge>
          {question.is_required && (
            <Badge variant="outline" className="text-xs">
              Required
            </Badge>
          )}
        </div>
      </div>

      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete question">
        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
