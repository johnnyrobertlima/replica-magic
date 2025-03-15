
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the API key (masked) for debugging
    console.log("Using Resend API key:", RESEND_API_KEY ? "****" + RESEND_API_KEY.slice(-4) : "Not set");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const contactMessage: ContactMessage = await req.json();
    console.log("Received contact message:", JSON.stringify(contactMessage));
    
    const emailHtml = `
      <h2>Nova mensagem de contato</h2>
      <p><strong>Nome:</strong> ${contactMessage.name}</p>
      <p><strong>Email:</strong> ${contactMessage.email}</p>
      ${contactMessage.phone ? `<p><strong>Telefone:</strong> ${contactMessage.phone}</p>` : ''}
      <p><strong>Mensagem:</strong> ${contactMessage.message}</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ONI Digital <comercial@oniagencia.com.br>",
        to: ["comercial@oniagencia.com.br"],
        subject: "Nova mensagem de contato - Site ONI",
        html: emailHtml,
        reply_to: contactMessage.email
      }),
    });

    const responseText = await res.text();
    console.log("Resend API response status:", res.status);
    console.log("Resend API response:", responseText);

    if (res.ok) {
      const data = JSON.parse(responseText);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      console.error("Resend API error:", responseText);
      return new Response(JSON.stringify({ error: responseText }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
