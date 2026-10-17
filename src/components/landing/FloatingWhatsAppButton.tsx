export function FloatingWhatsAppButton() {
  return (
    <a href="https://wa.me/5493795039055" target="_blank" rel="noopener noreferrer" aria-label="Abrir WhatsApp" className="fixed bottom-4 right-4 z-50 inline-flex min-h-14 items-center gap-2 rounded-full bg-[#1f8f4f] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.03] hover:bg-[#177840] sm:bottom-6 sm:right-6">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
      WhatsApp
    </a>
  );
}
