import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Target, Calendar } from "lucide-react";

type LeadDetails = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  goal: string | null;
  created_at: string;
  raw_payload: any;
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
      setLead(null);

      const { data, error: leadErr } = await supabase
        .from("leads")
        .select("id,name,email,phone,goal,created_at,raw_payload")
        .eq("id", leadId)
        .single();

      if (leadErr) {
        setError(leadErr.message);
        setLoading(false);
        return;
      }

      setLead(data as LeadDetails);
      setLoading(false);
    };

    load();
  }, [open, leadId]);

  const title = lead?.name || lead?.email || "Lead details";
  const payloadIsEmpty =
    !lead?.raw_payload || (typeof lead.raw_payload === "object" && Object.keys(lead.raw_payload).length === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Full lead details</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : !lead ? (
          <div className="text-sm text-muted-foreground">No data.</div>
        ) : (
          <div className="space-y-4">
            {/* Contact */}
            <div className="space-y-2">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a className="hover:underline" href={`mailto:${lead.email}`}>
                    {lead.email}
                  </a>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a className="hover:underline" href={`tel:${lead.phone}`}>
                    {lead.phone}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(lead.created_at).toLocaleString()}
              </div>

              {lead.goal && (
                <Badge variant="secondary" className="font-normal w-fit">
                  <Target className="w-3 h-3 mr-1" />
                  {lead.goal}
                </Badge>
              )}
            </div>

            {/* Raw payload */}
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium mb-2">Lead data</div>

              {payloadIsEmpty ? (
                <div className="text-sm text-muted-foreground">
                  No extra details stored for this lead yet (conversation history is not stored).
                </div>
              ) : (
                <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground">
                  {JSON.stringify(lead.raw_payload, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
