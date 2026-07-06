import 'server-only';

// ── AI integration hooks (Phase 2) ──────────────────────────────
// One small adapter so the storefront never depends on a specific vendor.
// Set ONE of these in your env to switch the concierge chat on:
//   OPENAI_API_KEY (+ optional OPENAI_MODEL)            — pay-as-you-go
//   HF_TOKEN       (+ optional HF_MODEL)                — Hugging Face free inference tier
// With neither set, isAIConfigured() is false and the UI falls back to WhatsApp.

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  name: string;
  chat(messages: ChatMessage[]): Promise<string>;
}

/** OpenAI-compatible chat completions — also works with Groq, OpenRouter, etc. via OPENAI_BASE_URL. */
function openAI(): AIProvider {
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  return {
    name: 'openai',
    async chat(messages) {
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages,
          max_tokens: 400,
          temperature: 0.6,
        }),
      });
      if (!res.ok) throw new Error(`AI provider error ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() ?? '';
    },
  };
}

/** Hugging Face Inference router (OpenAI-compatible endpoint). */
function huggingFace(): AIProvider {
  return {
    name: 'huggingface',
    async chat(messages) {
      const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.HF_MODEL || 'meta-llama/Llama-3.1-8B-Instruct',
          messages,
          max_tokens: 400,
          temperature: 0.6,
        }),
      });
      if (!res.ok) throw new Error(`AI provider error ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() ?? '';
    },
  };
}

export function getAIProvider(): AIProvider | null {
  if (process.env.OPENAI_API_KEY) return openAI();
  if (process.env.HF_TOKEN) return huggingFace();
  return null;
}

export const isAIConfigured = () => getAIProvider() !== null;
