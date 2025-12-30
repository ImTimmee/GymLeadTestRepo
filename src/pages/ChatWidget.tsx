import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Send, CheckCircle, MessageSquare, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FlowData {
  id: string;
  welcome_message: string;
  confirmation_message: string;
  gdpr_enabled: boolean;
  gdpr_text: string;
  user_id: string;
  is_published?: boolean;
}

interface Question {
  id: string;
  question_text: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  options: string[] | null;
  order_index: number;
}

interface Profile {
  business_name: string | null;
  accent_color: string | null;
}

export default function ChatWidget() {
  // Route param can be either a user_id OR a flow.id (we support both)
  const { userId } = useParams<{ userId: string }>();

  const [flow, setFlow] = useState<FlowData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [gdprConsent, setGdprConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFlow() {
      if (!userId) return;

      setLoading(true);

      try {
        // ✅ Robust: accept either flow.id or flow.user_id in the URL param
        const { data: flowData, error: flowError } = await supabase
          .from('chatbot_flows')
          .select('*')
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .eq('is_published', true)
          .maybeSingle();

        if (flowError) throw flowError;

        if (!flowData) {
          setFlow(null);
          setQuestions([]);
          setProfile(null);
          return;
        }

        setFlow(flowData as FlowData);

        // Get questions for this flow
        const { data: questionsData, error: questionsError } = await supabase
          .from('flow_questions')
          .select('*')
          .eq('flow_id', flowData.id)
          .order('order_index');

        if (questionsError) throw questionsError;
        setQuestions((questionsData as Question[]) || []);

        // ✅ IMPORTANT: profile + leads belong to the real owner user_id
        const ownerUserId = flowData.user_id;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('business_name, accent_color')
          .eq('user_id', ownerUserId)
          .maybeSingle();

        if (profileError) {
          // not fatal
          console.warn('Profile load warning:', profileError);
        }

        setProfile((profileData as Profile) || null);
      } catch (error) {
        console.error('Error loading flow:', error);
        toast.error('Failed to load chatbot');
      } finally {
        setLoading(false);
      }
    }

    loadFlow();
  }, [userId]);

  const handleSubmit = async () => {
    if (flow?.gdpr_enabled && !gdprConsent) {
      toast.error('Please accept the consent checkbox');
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Use flow.user_id (owner) instead of route param
      const ownerUserId = flow?.user_id;
      if (!ownerUserId) throw new Error('Missing owner user id');

      const { error } = await supabase.from('leads').insert({
        user_id: ownerUserId,
        name: answers.name || null,
        email: answers.email || null,
        phone: answers.phone || null,
        goal: answers.goal || null,
        raw_payload: answers,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion?.is_required && !answers[currentQuestion.field_name]) {
      toast.error('This field is required');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const accentColor = profile?.accent_color || '#84cc16';
  const businessName = profile?.business_name || 'LeadBot';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Chatbot Not Found</h1>
          <p className="text-muted-foreground">
            This chatbot is not available or has been unpublished.
          </p>
        </div>
      </div>
    );
  }

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

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep >= questions.length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">{businessName}</h1>
        </div>

        {/* Chat area */}
        <div className="space-y-4">
          {/* Welcome message */}
          {currentStep === 0 && (
            <div
              className="rounded-2xl rounded-tl-none p-4 text-white max-w-[85%]"
              style={{ backgroundColor: accentColor }}
            >
              <p>{flow.welcome_message}</p>
            </div>
          )}

          {/* Current question */}
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

              {/* Answer input */}
              <div className="ml-auto max-w-[85%] space-y-3">
                {currentQuestion.field_type === 'textarea' ? (
                  <Textarea
                    placeholder="Type your answer..."
                    value={answers[currentQuestion.field_name] || ''}
                    onChange={(e) =>
                      setAnswers({ ...answers, [currentQuestion.field_name]: e.target.value })
                    }
                    className="min-h-24"
                  />
                ) : currentQuestion.field_type === 'select' && currentQuestion.options ? (
                  <Select
                    value={answers[currentQuestion.field_name] || ''}
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
                      currentQuestion.field_type === 'email'
                        ? 'email'
                        : currentQuestion.field_type === 'phone'
                        ? 'tel'
                        : 'text'
                    }
                    placeholder={`Enter your ${currentQuestion.field_name.replace('_', ' ')}`}
                    value={answers[currentQuestion.field_name] || ''}
                    onChange={(e) =>
                      setAnswers({ ...answers, [currentQuestion.field_name]: e.target.value })
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  />
                )}

                <Button onClick={handleNext} className="w-full" style={{ backgroundColor: accentColor }}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Final step - submit */}
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
                {submitting ? 'Submitting...' : 'Submit'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-1">
          {[...Array(questions.length + 1)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: i <= currentStep ? accentColor : 'hsl(var(--muted))',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
