import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Database } from "../../../src/types/supabase-types"; // Path to your types

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const { type, record } = await req.json();

    // Only process INSERT events for AetherNet v2.1 AP2 Mandates
    if (
      type !== "INSERT" || 
      record.protocol_version !== "2.1" || 
      record.metadata?.payload_type !== "ap2_mandate"
    ) {
      return new Response("Not an AP2 v2.1 mandate. Ignored.", { status: 200 });
    }

    console.log(`Processing AP2 Mandate for Message: ${record.id}`);

    // In a production TEE, this is where the Gateway decrypts the payload 
    // using its own private key. For this webhook, we parse the content/payload.
    const payload = typeof record.encrypted_payload === 'string' 
      ? JSON.parse(record.encrypted_payload) // Mock decryption step
      : record.metadata?.parsed_payload; 

    if (!payload || !payload.type) {
      throw new Error("Invalid or missing AP2 Payload");
    }

    // Determine relational IDs based on mandate type
    let parentMandateId = null;
    let issuerDid = record.sender_id;
    let delegateDid = null;
    let merchantDid = null;

    if (payload.type === 'AP2_CART') {
      parentMandateId = payload.intent_ref; // Cart points to Intent
      merchantDid = record.sender_id;
    } else if (payload.type === 'AP2_PAYMENT') {
      parentMandateId = payload.cart_ref; // Payment points to Cart
    } else if (payload.type === 'AP2_INTENT') {
      delegateDid = payload.delegate;
    }

    // Insert into the new relational table
    const { error: insertError } = await supabase
      .from("aethernet_ap2_mandates")
      .insert({
        message_id: record.id,
        mandate_type: payload.type,
        parent_mandate_id: parentMandateId,
        issuer_did: issuerDid,
        delegate_did: delegateDid,
        merchant_did: merchantDid,
        amount: payload.amount || payload.total_amount || payload.constraints?.max_amount,
        currency: payload.currency || "USDCx",
        status: "pending",
        expires_at: payload.valid_until || payload.constraints?.expires_at || null,
        signature: payload.signature || payload.agent_signature || payload.merchant_signature,
        payload: payload,
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, messageId: record.id }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing AP2 Mandate:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
