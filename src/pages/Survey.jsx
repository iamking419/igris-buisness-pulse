import React from 'react'

export default function Survey(){
  return (
    <div>
      {/* We'll mount the survey stage into React but reuse existing data/questions and logic by importing the modules into src/lib later */}
      <header className="border-b border-[var(--line)]">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/assets/igris-logo.png" alt="IGRIS Technologies" className="h-7 w-auto" />
            <span className="font-semibold tracking-tight text-[15px]">IGRIS</span>
          </a>
          <a href="/" className="text-sm text-[var(--muted)] link-underline">Exit survey</a>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 sm:px-8 py-14 sm:py-20 flex flex-col">
        <div className="mb-10">
          <div className="flex justify-between items-baseline mb-3">
            <span id="q-counter" className="text-sm text-[var(--muted)]"></span>
          </div>
          <div className="h-[2px] bg-[var(--line)] w-full">
            <div id="progress-fill" className="progress-fill h-[2px] bg-[var(--ink)]" style={{width: '0%'}}></div>
          </div>
        </div>

        <div id="survey-stage" className="flex-1"></div>
        <div id="survey-live" className="sr-only" aria-live="polite"></div>

        <div className="flex items-center justify-between mt-12 pt-6 border-t border-[var(--line)]">
          <button id="btn-back" type="button" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] disabled:cursor-not-allowed">← Back</button>
          <button id="btn-continue" type="button" className="arrow-cta inline-flex items-center gap-2 bg-[var(--ink)] text-white px-7 py-3.5 text-sm hover:opacity-90 disabled:cursor-not-allowed">Continue <span className="arrow-glyph">→</span></button>
        </div>
      </main>
    </div>
  )
}
