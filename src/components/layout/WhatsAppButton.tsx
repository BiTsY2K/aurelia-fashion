'use client';

import { whatsappLink } from '@/lib/utils';

export default function WhatsAppButton() {
  const href = whatsappLink('Hi Aurelia, I’d love some styling help.');
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with our stylist on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-13 w-13 place-items-center rounded-full bg-[#25D366] p-3.5 text-white shadow-lift transition-transform duration-300 ease-brand hover:scale-105"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.05L2 22l5.07-1.33A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 5.73 13.83 8.1 8.1 0 0 1-9.9 1.2l-.36-.21-3 .79.8-2.93-.23-.38A8.1 8.1 0 0 1 12.04 3.8Zm-3.2 3.9c-.17 0-.45.06-.69.31-.24.25-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.8 2.86 4.46 3.9 2.22.86 2.67.69 3.15.65.48-.04 1.56-.64 1.78-1.26.22-.62.22-1.15.16-1.26-.07-.11-.24-.17-.5-.3-.27-.13-1.57-.78-1.81-.87-.24-.09-.42-.13-.6.13-.17.25-.68.86-.83 1.03-.16.17-.31.2-.57.07-.27-.13-1.13-.42-2.15-1.33-.8-.71-1.33-1.59-1.49-1.85-.15-.26-.02-.4.11-.53.12-.12.27-.31.4-.46.14-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.44-.82-1.97-.21-.52-.43-.45-.6-.46h-.5Z" />
      </svg>
    </a>
  );
}
