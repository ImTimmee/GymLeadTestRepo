import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing id" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error: "Missing env vars: VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: flow, error: flowError } = await supabase
    .from("chatbot_flows")
    .select("id,user_id,welcome_message,confirmation_message,gdpr_enabled,gdpr_text,is_published")
    .or(`id.eq.${id},user_id.eq.${id}`)
    .eq("is_published", true)
    .maybeSingle();

  if (flowError) return res.status(500).json({ error: flowError.message });
  if (!flow) return res.status(404).json({ error: "Chatbot not found" });

  const { data: questions, error: qErr } = await supabase
    .from("flow_questions")
    .select("id,question_text,field_name,field_type,is_required,options,order_index,flow_id")
    .eq("flow_id", flow.id)
    .order("order_index", { ascending: true });

  if (qErr) return res.status(500).json({ error: qErr.message });

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name,accent_color")
    .eq("user_id", flow.user_id)
    .maybeSingle();

  return res.status(200).json({
    flow,
    questions: questions ?? [],
    profile: profile ?? null,
  });
}
