import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EmbedQuestion = {
  id: string;
  question_text: string;
  field_name: string;
  field_type: "text" | "email" | "phone" | "select" | "textarea";
  is_required: boolean;
  options: string[] | null;
  order_index: number;
};

type EmbedConfig = {
  flow: {
    id: string;
    user_id: string;
    welcome_message: string;
    confirmation_message: string;
    gdpr_enabled: boolean;
    gdpr_text: string;
  };
  questions: EmbedQuestion[];
  profile: {
    business_name: string | null;
    accent_color: string | null;
  } | null;
};

// base64 decode that survives unicode
function b64ToUtf8(b64: string) {
  const binStr = atob(b64);
  const bytes = Uint8Array.from(binStr, (m) => m.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function EmbedChat() {
  const config = useMemo<EmbedConfig | null>(() => {
    try {
      const hash = (window.location.hash || "").replace(/^#/, "");
      if (!hash) return null;
      const json = b64ToUtf8(hash);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [gdprConsent, setGdprConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Chatbot Not Found</h1>
          <p className="text-muted-foreground">Invalid embed configuration.</p>
        </div>
      </div>
    );
  }

  const { flow, questions, profile } = config;
  const accentColor = profile?.accent_color || "#84cc16";
  const businessName = profile?.business_name || "LeadBot";

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep >= questions.length;

  const handleNext = () => {
    if (currentQuestion?.is_required && !answers[currentQuestion.field_name]) {
      toast.error("This field is required");
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (flow.gdpr_enabled && !gdprConsent) {
      toast.error("Please accept the consent checkbox");
      return;
    }

    setSubmitting(true);
    try {
      // We try inserting leads via anon key.
      // If your DB blocks anon inserts too, we’ll switch this to an email/webhook later.
      const { error } = await supabase.from("leads").insert({
        user_id: flow.user_id,
        name: answers.name || null,
        email: answers.email || null,
        phone: answers.phone || null,
        goal: answers.goal || null,
        raw_payload: answers,
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{flow.confirmation_message}</h1>
            <p className="text-muted-foreground">We'll get back to you as soon as possible.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">{businessName}</h1>
        </div>

        <div className="space-y-4">
          {currentStep === 0 && (
            <div
              className="rounded-2xl rounded-tl-none p-4 text-white max-w-[85%]"
              style={{ backgroundColor: accentColor }}
            >
              <p>{flow.welcome_message}</p>
            </div>
          )}

          {currentQuestion && (
            <>
              <div
                className="rounded-2xl rounded-tl-none p-4 text-white max-w-[85%]"
                style={{ backgroundColor: accentColor }}
              >
                <p>{currentQuestion.question_text}</p>
                {currentQuestion.is_required && (
                  <span className="text-xs opacity-75 mt-1 block">* Required</span>
                )}
              </div>

              <div className="ml-auto max-w-[85%] space-y-3">
                {currentQuestion.field_type === "textarea" ? (
                  <Textarea
                    placeholder="Type your answer..."
                    value={answers[currentQuestion.field_name] || ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [currentQuestion.field_name]: e.target.value })
                    }
                    className="min-h-24"
                  />
                ) : currentQuestion.field_type === "select" && currentQuestion.options ? (
                  <Select
                    value={answers[currentQuestion.field_name] || ""}
                    onValueChange={(v) =>
                      setAnswers({ ...answers, [currentQuestion.field_name]: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentQuestion.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={
                      currentQuestion.field_type === "email"
                        ? "email"
                        : currentQuestion.field_type === "phone"
                        ? "tel"
                        : "text"
                    }
                    placeholder={`Enter your ${currentQuestion.field_name.replace("_", " ")}`}
                    value={answers[currentQuestion.field_name] || ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [currentQuestion.field_name]: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  />
                )}

                <Button onClick={handleNext} className="w-full" style={{ backgroundColor: accentColor }}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {isLastStep && (
            <div className="space-y-4">
              <div
                className="rounded-2xl rounded-tl-none p-4 text-white max-w-[85%]"
                style={{ backgroundColor: accentColor }}
              >
                <p>Great! That's all I need. Ready to submit?</p>
              </div>

              {flow.gdpr_enabled && (
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Checkbox
                    id="gdpr"
                    checked={gdprConsent}
                    onCheckedChange={(v) => setGdprConsent(v === true)}
                  />
                  <Label htmlFor="gdpr" className="text-sm leading-relaxed">
                    {flow.gdpr_text}
                  </Label>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
                style={{ backgroundColor: accentColor }}
              >
                {submitting ? "Submitting..." : "Submit"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-1">
          {[...Array(questions.length + 1)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: i <= currentStep ? accentColor : "hsl(var(--muted))",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
