import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Target } from "lucide-react";

const MESSAGES_TABLE = "messages"; // <-- als dit bij jou anders heet, hier aanpassen

type Message = {
  id: string;
  role: string;        // "user" | "assistant"
  content: string;
  created_at: string;
};

type LeadDetails = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  goal: string | null;
  created_at: string;
  messages?: Message[];
};

export function LeadDetailsDialog({
  leadId,
  open,
  onOpenChange,
}: {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState<LeadDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !leadId) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      // 1) Lead ophalen
      const { data: leadData, error: leadErr } = await supabase
        .from("leads")
        .select("id,name,email,phone,goal,created_at")
        .eq("id", leadId)
        .single();

      if (leadErr) {
        setError(leadErr.message);
        setLead(null);
        setLoading(false);
        return;
      }

      // 2) Messages ophalen (full conversation)
      // Assumptie: messages hebben kolom lead_id
      const { data: msgData, error: msgErr } = await supabase
        .from(MESSAGES_TABLE)
        .select("id,role,content,created_at")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (msgErr) {
        // Als table/kolom naam anders is, zie je dit meteen in de UI
        setError(msgErr.message);
        setLead({ ...(leadData as LeadDetails), messages: [] });
        setLoading(false);
        return;
      }

      setLead({ ...(leadData as LeadDetails), messages: (msgData as Message[]) ?? [] });
      setLoading(false);
    };

    load();
  }, [open, leadId]);

  const title = lead?.name || lead?.email || "Lead details";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Full lead details and conversation history
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-600">
            {error}
            <div className="text-xs text-muted-foreground mt-2">
              Tip: check of je messages table <b>{MESSAGES_TABLE}</b> heet en of er een <b>lead_id</b> kolom is.
            </div>
          </div>
        ) : !lead ? (
          <div className="text-sm text-muted-foreground">No data.</div>
        ) : (
          <div className="space-y-4">
            {/* Contact */}
            <div className="space-y-2">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a className="hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a className="hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a>
                </div>
              )}
              {lead.goal && (
                <Badge variant="secondary" className="font-normal w-fit">
                  <Target className="w-3 h-3 mr-1" />
                  {lead.goal}
                </Badge>
              )}
            </div>

            {/* Conversation */}
            <div className="rounded-lg border p-3 max-h-[55vh] overflow-auto space-y-3">
              {lead.messages && lead.messages.length > 0 ? (
                lead.messages.map((m) => (
                  <div
                    key={m.id}
                    className={m.role === "user" ? "text-left" : "text-right"}
                  >
                    <div className="inline-block rounded-lg border px-3 py-2 text-sm">
                      <div className="text-xs text-muted-foreground mb-1">
                        {m.role} • {new Date(m.created_at).toLocaleString()}
                      </div>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No conversation messages found for this lead.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
