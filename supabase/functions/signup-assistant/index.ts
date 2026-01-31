import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um assistente educacional do EduCore, uma plataforma de preparação para vestibulares e ETEC.

Seu papel é ajudar estudantes durante o processo de cadastro, especialmente:

1. **Cálculo de Renda Per Capita Familiar**: 
   - Renda per capita = Renda Bruta Familiar Mensal ÷ Número de pessoas na família
   - Explique de forma clara e didática
   - Ajude a identificar todas as fontes de renda da família
   - O salário mínimo atual (2024) é R$ 1.412,00
   
2. **Orientação sobre Isenção de Taxas**:
   - FUVEST: Renda per capita até 1,5 salário mínimo
   - UNICAMP: Renda per capita até 1,5 salário mínimo  
   - UNESP: Renda per capita até 2 salários mínimos
   - ENEM: Renda per capita até meio salário mínimo
   
3. **Dúvidas sobre o Cadastro**:
   - Ajude com dúvidas sobre preenchimento de campos
   - Explique a importância de cada informação
   - Seja acolhedor e paciente

Responda sempre em português brasileiro, de forma clara, objetiva e amigável.
Use formatação quando apropriado (listas, negrito para valores importantes).
Mantenha respostas concisas mas completas.

${context ? `Contexto atual do usuário: ${context}` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com o assistente de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Signup assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
