import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFlow, FlowQuestion } from '@/hooks/useFlow';
import { useProfile } from '@/hooks/useProfile';
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
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'textarea', label: 'Long Text' },
];

export default function FlowBuilder() {
  const { flow, flowLoading, questions, questionsLoading, updateFlow, addQuestion, updateQuestion, deleteQuestion } = useFlow();
  const { profile } = useProfile();

  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [gdprEnabled, setGdprEnabled] = useState(true);
  const [gdprText, setGdprText] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    field_name: '',
    field_type: 'text',
    is_required: true,
    options: [] as string[],
  });

  const [optionsInput, setOptionsInput] = useState('');
  const [copied, setCopied] = useState(false);

  // ✅ snippet dialog
  const [snippetOpen, setSnippetOpen] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);

  // Initialize form values when flow loads
  useState(() => {
    if (flow) {
      setWelcomeMessage(flow.welcome_message || '');
      setConfirmationMessage(flow.confirmation_message || '');
      setGdprEnabled(flow.gdpr_enabled ?? true);
      setGdprText(flow.gdpr_text || '');
    }
  });

  const handleSaveFlow = () => {
    updateFlow.mutate({
      welcome_message: welcomeMessage || flow?.welcome_message,
      confirmation_message: confirmationMessage || flow?.confirmation_message,
      gdpr_enabled: gdprEnabled,
      gdpr_text: gdprText || flow?.gdpr_text,
    });
  };

  const handlePublish = () => {
    updateFlow.mutate({ is_published: !flow?.is_published });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question_text || !newQuestion.field_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const options = newQuestion.field_type === 'select'
      ? optionsInput.split(',').map(o => o.trim()).filter(Boolean)
      : null;

    addQuestion.mutate({
      question_text: newQuestion.question_text,
      field_name: newQuestion.field_name.toLowerCase().replace(/\s+/g, '_'),
      field_type: newQuestion.field_type,
      is_required: newQuestion.is_required,
      options,
      order_index: questions.length,
    });

    setNewQuestion({ question_text: '', field_name: '', field_type: 'text', is_required: true, options: [] });
    setOptionsInput('');
    setIsAddDialogOpen(false);
  };

  // Existing share link (public chatbot)
  const widgetUrl = flow?.id ? `${window.location.origin}/chat/${flow.user_id}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(widgetUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Embed snippet
  const widgetUrl = flow?.user_id ? `${window.location.origin}/chat/${flow.user_id}` : "";
const embedScriptUrl = `${window.location.origin}/embed.js`;

const embedSnippet = `<script
  src="${embedScriptUrl}"
  data-chatbot-url="${widgetUrl}">
</script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(embedSnippet);
    setSnippetCopied(true);
    toast.success('Snippet copied to clipboard');
    setTimeout(() => setSnippetCopied(false), 2000);
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
              <CardDescription>
                Customize the messages your chatbot displays
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea
                  placeholder="Hi! 👋 I'm here to help you get started..."
                  value={welcomeMessage || flow?.welcome_message || ''}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmation Message</Label>
                <Textarea
                  placeholder="Thanks! We'll be in touch soon."
                  value={confirmationMessage || flow?.confirmation_message || ''}
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
                <CardDescription>
                  Add questions to collect information from leads
                </CardDescription>
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
                    <DialogDescription>
                      Create a new question to ask your leads
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Input
                        placeholder="What's your name?"
                        value={newQuestion.question_text}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field Name</Label>
                      <Input
                        placeholder="name"
                        value={newQuestion.field_name}
                        onChange={(e) => setNewQuestion({ ...newQuestion, field_name: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Used internally to identify this field</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={newQuestion.field_type}
                        onValueChange={(v) => setNewQuestion({ ...newQuestion, field_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newQuestion.field_type === 'select' && (
                      <div className="space-y-2">
                        <Label>Options (comma-separated)</Label>
                        <Input
                          placeholder="Option 1, Option 2, Option 3"
                          value={optionsInput}
                          onChange={(e) => setOptionsInput(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newQuestion.is_required}
                        onCheckedChange={(v) => setNewQuestion({ ...newQuestion, is_required: v })}
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
                  {questions.map((question, index) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                      onUpdate={(updates) => updateQuestion.mutate({ id: question.id, ...updates })}
                      onDelete={() => deleteQuestion.mutate(question.id)}
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
              <CardDescription>
                Add a consent checkbox for data collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={gdprEnabled ?? flow?.gdpr_enabled ?? true}
                  onCheckedChange={setGdprEnabled}
                />
                <Label>Enable GDPR consent checkbox</Label>
              </div>
              {(gdprEnabled ?? flow?.gdpr_enabled) && (
                <div className="space-y-2">
                  <Label>Consent Text</Label>
                  <Textarea
                    placeholder="I agree to the processing of my personal data."
                    value={gdprText || flow?.gdpr_text || ''}
                    onChange={(e) => setGdprText(e.target.value)}
                    rows={2}
                  />
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
          <Card className={flow?.is_published ? 'border-green-500/50 bg-green-500/5' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Status</CardTitle>
                <Badge variant={flow?.is_published ? 'default' : 'secondary'}>
                  {flow?.is_published ? 'Live' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {flow?.is_published
                  ? 'Your chatbot is live and collecting leads.'
                  : 'Publish your chatbot to start collecting leads.'}
              </p>
              <Button
                onClick={handlePublish}
                disabled={updateFlow.isPending}
                variant={flow?.is_published ? 'outline' : 'default'}
                className={!flow?.is_published ? 'w-full gradient-primary' : 'w-full'}
              >
                <Eye className="w-4 h-4 mr-2" />
                {flow?.is_published ? 'Unpublish' : 'Publish Chatbot'}
              </Button>
            </CardContent>
          </Card>

          {/* Share link */}
          {flow?.is_published && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Link</CardTitle>
                <CardDescription>
                  Share this link to let people access your chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={widgetUrl} readOnly className="text-xs" />
                  <Button size="icon" variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Chatbot
                  </a>
                </Button>

                {/* ✅ NEW: Get snippet */}
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
                        Copy and paste this code into your website (WordPress/HTML).
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <pre className="text-xs whitespace-pre-wrap break-words">
                          {embedSnippet}
                        </pre>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          This loads <span className="font-mono">{embedScriptUrl}</span>
                        </p>
                        <Button variant="default" onClick={handleCopySnippet}>
                          {snippetCopied ? (
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
                style={{ backgroundColor: profile?.accent_color || '#84cc16' }}
              >
                <p className="font-medium mb-2">{profile?.business_name || 'Your Business'}</p>
                <p className="opacity-90">{welcomeMessage || flow?.welcome_message || 'Hi! 👋'}</p>
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
  index,
  onUpdate,
  onDelete
}: {
  question: FlowQuestion;
  index: number;
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
            {fieldTypes.find(f => f.value === question.field_type)?.label || question.field_type}
          </Badge>
          {question.is_required && (
            <Badge variant="outline" className="text-xs">Required</Badge>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
