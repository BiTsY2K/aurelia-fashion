'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { openWhatsApp } from '@/lib/enquiry';
import { cn } from '@/lib/utils';

interface Msg { role: 'user' | 'assistant'; content: string }

const GREETING: Msg = {
  role: 'assistant',
  content: 'Namaste! I’m the Aurelia stylist. Tell me the occasion, your favourite colours, or who you’re dressing — and I’ll suggest a few pieces.',
};

export const WhatsAppGlyph = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.05L2 22l5.07-1.33A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 5.73 13.83 8.1 8.1 0 0 1-9.9 1.2l-.36-.21-3 .79.8-2.93-.23-.38A8.1 8.1 0 0 1 12.04 3.8Zm-3.2 3.9c-.17 0-.45.06-.69.31-.24.25-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.8 2.86 4.46 3.9 2.22.86 2.67.69 3.15.65.48-.04 1.56-.64 1.78-1.26.22-.62.22-1.15.16-1.26-.07-.11-.24-.17-.5-.3-.27-.13-1.57-.78-1.81-.87-.24-.09-.42-.13-.6.13-.17.25-.68.86-.83 1.03-.16.17-.31.2-.57.07-.27-.13-1.13-.42-2.15-1.33-.8-.71-1.33-1.59-1.49-1.85-.15-.26-.02-.4.11-.53.12-.12.27-.31.4-.46.14-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.44-.82-1.97-.21-.52-.43-.45-.6-.46h-.5Z" />
  </svg>
);

/**
 * Floating concierge: one tap to WhatsApp, plus the AI stylist chat hook.
 * The chat is live once OPENAI_API_KEY or HF_TOKEN is set; until then it
 * explains itself and hands the conversation to WhatsApp.
 */
export default function Concierge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  // Ask once whether the AI provider is configured, so the input can explain itself up front.
  const checked = useRef(false);
  useEffect(() => {
    if (!open || checked.current) return;
    checked.current = true;
    fetch('/api/ai/chat')
      .then((r) => r.json())
      .then((d) => setAiAvailable(Boolean(d.configured)))
      .catch(() => setAiAvailable(false));
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  if (pathname?.startsWith('/admin')) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.configured === false) setAiAvailable(false);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply ?? data.error ?? 'Something went wrong.' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'I couldn’t connect just now — our team is on WhatsApp.' }]);
    } finally {
      setBusy(false);
    }
  };

  const toWhatsApp = () => {
    const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')?.content;
    openWhatsApp(
      'contact',
      lastQuestion ? `Hi Aurelia! ${lastQuestion}` : 'Hi Aurelia, I’d love some styling help.',
      { message: lastQuestion },
    );
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Aurelia concierge"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(560px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-line bg-ivory shadow-lift"
          >
            <div className="flex items-center justify-between bg-carbon px-5 py-4 text-ivory">
              <div>
                <p className="font-display text-lg">Aurelia Concierge</p>
                <p className="text-xs text-ivory/70">
                  AI stylist {aiAvailable ? '· beta' : '· coming soon'} · Team on WhatsApp
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 hover:bg-ivory/10">
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {messages.map((m, i) => (
                <p key={i} className={cn(
                  'max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm',
                  m.role === 'user' ? 'ml-auto bg-carbon text-ivory' : 'bg-blush-soft text-carbon',
                )}>
                  {m.content}
                </p>
              ))}
              {busy && <p className="w-16 animate-pulse rounded-2xl bg-blush-soft px-3.5 py-2.5 text-sm">…</p>}
            </div>

            <div className="border-t border-line p-3">
              <button onClick={toWhatsApp}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-pill bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.01]">
                <WhatsAppGlyph /> Continue on WhatsApp
              </button>
              <form onSubmit={send} className="flex gap-2">
                <label htmlFor="concierge-input" className="sr-only">Message the stylist</label>
                <input id="concierge-input" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={aiAvailable ? 'e.g. A pastel look for a day mehendi' : 'AI stylist coming soon'}
                  disabled={!aiAvailable}
                  className="h-10 flex-1 rounded-pill border border-line bg-ivory-soft px-4 text-sm outline-none focus:border-carbon disabled:opacity-60" />
                <button type="submit" disabled={busy || !aiAvailable || !input.trim()} className="btn-pill h-10 px-4 disabled:opacity-40">Send</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close concierge' : 'Chat with our stylist'}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform duration-300 ease-brand hover:scale-105"
      >
        {open
          ? <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 6 6 18M6 6l12 12" /></svg>
          : <WhatsAppGlyph size={26} />}
      </button>
    </>
  );
}
