import React from 'react'

export default function ThankYou(){
  return (
    <div>
      <header className="border-b border-[var(--line)]">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-5">
          <div className="flex items-center gap-3">
            <img src="/assets/igris-logo.png" alt="IGRIS Technologies" className="h-7 w-auto" />
            <span className="font-semibold tracking-tight text-[15px]">IGRIS</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 sm:px-8 py-20 sm:py-28">
        <p className="mono-tag text-xs text-[var(--muted)] mb-6">RESPONSE RECEIVED</p>
        <h1 className="text-3xl sm:text-5xl font-medium leading-tight mb-6">Your response is now part of the picture.</h1>
        <p className="text-[var(--muted)] leading-relaxed max-w-lg">Your answers help us understand what Nigerian businesses actually need — not what we assume they need.</p>
        <p id="response-id" className="mono-tag text-sm text-[var(--muted)] mt-8"></p>

        <div className="mt-16 pt-10 border-t border-[var(--line)]">
          <p className="text-sm text-[var(--muted)] mb-3">WHAT HAPPENS NEXT</p>
          <p className="leading-relaxed max-w-lg">Your response joins the research dataset. As responses grow, we'll look for patterns across industries, business types, and operational challenges.</p>
        </div>

        <div id="recommendation-block" className="hidden mt-16 pt-10 border-t border-[var(--line)]">
          <p className="text-sm text-[var(--muted)] mb-3">A POSSIBLE NEXT STEP</p>
          <p id="rec-eyebrow" className="mb-2"></p>
          <p id="rec-body" className="text-[var(--muted)] leading-relaxed max-w-lg mb-5"></p>
          <a id="rec-cta" href="#" target="_blank" rel="noopener" className="link-underline text-sm"></a>
        </div>

        <div className="mt-16 pt-10 border-t border-[var(--line)]">
          <p className="mb-1">Know another business owner?</p>
          <p className="text-sm text-[var(--muted)] mb-5">Help us get a better picture.</p>
          <div className="flex flex-wrap gap-4">
            <button id="btn-share" type="button" className="arrow-cta inline-flex items-center gap-2 border border-[var(--ink)] px-6 py-3.5 text-sm hover:bg-[var(--ink)] hover:text-white transition-colors duration-200">Share Business Pulse <span className="arrow-glyph">→</span></button>
            <a id="btn-whatsapp" href="#" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-[var(--line)] px-6 py-3.5 text-sm hover:border-[var(--ink)]">Share on WhatsApp</a>
          </div>
          <p id="share-copied" className="hidden text-sm text-[var(--muted)] mt-3">Link copied.</p>
        </div>

        <div className="mt-16">
          <a href="/" className="link-underline text-sm">← Back to Business Pulse</a>
        </div>
      </main>
    </div>
  )
}
