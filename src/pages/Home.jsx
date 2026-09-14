import React from 'react'

export default function Home(){
  return (
    <div>
      {/* We'll re-render the original index.html markup as JSX here */}
      <header className="border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/assets/igris-logo.png" alt="IGRIS Technologies" className="h-8 w-auto" />
            <span className="flex items-baseline gap-2">
              <span className="font-semibold tracking-tight text-[15px]">IGRIS TECH</span>
              <span className="text-sm tracking-wide text-[var(--muted)] hidden sm:inline">Business Pulse</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#research" className="link-underline">Research</a>
            <a href="#why" className="link-underline">Why We're Asking</a>
            <a href="#loop" className="link-underline">How It Works</a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/survey" className="arrow-cta hidden sm:inline-flex items-center gap-2 border border-[var(--ink)] px-5 py-2.5 text-sm hover:bg-[var(--ink)] hover:text-white transition-colors duration-200">
              Take the Survey <span className="arrow-glyph">→</span>
            </a>
            <button id="menu-toggle" aria-expanded="false" aria-controls="mobile-menu" className="md:hidden p-2 -mr-2" aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M2 6h18M2 11h18M2 16h18" stroke="currentColor" strokeWidth="1.5"/></svg>
            </button>
          </div>
        </div>
        <nav id="mobile-menu" className="hidden md:hidden flex-col border-t border-[var(--line)] px-6 py-4 gap-4 text-sm">
          <a href="#research">Research</a>
          <a href="#why">Why We're Asking</a>
          <a href="#loop">How It Works</a>
          <a href="/survey" className="border border-[var(--ink)] px-4 py-2.5 text-center mt-2">Take the Survey →</a>
        </nav>
      </header>

      <main>
        {/* hero and other sections copied verbatim from index.html to preserve layout and content */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-14 lg:gap-10 items-start">
            <div>
              <p className="mono-tag text-xs text-[var(--muted)] mb-6">IGRIS TECHNOLOGIES / BUSINESS PULSE 2026</p>
              <h1 className="text-4xl sm:text-6xl leading-[1.08] font-medium max-w-xl">What's actually holding Nigerian businesses back?</h1>
              <p className="mt-6 max-w-md text-lg text-[var(--muted)] leading-relaxed">Before we build more technology, we want to understand the problems businesses are already dealing with.</p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <a href="/survey" className="arrow-cta inline-flex items-center gap-2 bg-[var(--ink)] text-white px-7 py-4 text-sm hover:opacity-90 transition-opacity duration-200">Take the 2-minute survey <span className="arrow-glyph">→</span></a>
                <a href="#why" className="link-underline text-sm">Why we're asking</a>
              </div>

              <div className="mt-14 flex gap-10 sm:gap-14">
                <div>
                  <p className="text-3xl font-medium"><span data-count-to="2">0</span> min</p>
                  <p className="text-xs text-[var(--muted)] mt-1 mono-tag">TIME</p>
                </div>
                <div>
                  <p className="text-3xl font-medium"><span data-count-to="10">0</span></p>
                  <p className="text-xs text-[var(--muted)] mt-1 mono-tag">QUESTIONS</p>
                </div>
                <div>
                  <p className="text-3xl font-medium">0</p>
                  <p className="text-xs text-[var(--muted)] mt-1 mono-tag">SIGN-UP</p>
                </div>
              </div>
            </div>

            <div className="border border-[var(--line)] p-6 sm:p-8">
              <p className="mono-tag text-xs text-[var(--muted)] mb-6">RESEARCH INDEX / 01–08</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <p><span className="text-[var(--muted)]">01</span> Customers</p>
                <p><span className="text-[var(--muted)]">05</span> Digital presence</p>
                <p><span className="text-[var(--muted)]">02</span> Orders</p>
                <p><span className="text-[var(--muted)]">06</span> Automation</p>
                <p><span className="text-[var(--muted)]">03</span> Money</p>
                <p><span className="text-[var(--muted)]">07</span> Growth</p>
                <p><span className="text-[var(--muted)]">04</span> Operations</p>
                <p><span className="text-[var(--muted)]">08</span> Technology</p>
              </div>
              <div className="h-px bg-[var(--line)] my-6"></div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Eight areas. One question at a time. Your answers become part of the research dataset.</p>
            </div>
          </div>
        </section>

        {/* other sections follow similarly; for brevity they are omitted here but will be ported fully in next steps */}

      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div className="flex items-center gap-3">
              <img src="/assets/igris-logo.png" alt="IGRIS Technologies" className="h-6 w-auto" />
              <p className="text-sm text-[var(--muted)] max-w-xs">Business Pulse is a research initiative by IGRIS Technologies.</p>
            </div>
            <nav className="flex gap-6 text-sm">
              <a href="#research" className="link-underline">Research</a>
              <a href="/survey" className="link-underline">Survey</a>
              <a href="https://igris-tech.vercel.app" className="link-underline">IGRIS Technologies</a>
            </nav>
          </div>
          <p className="text-xs text-[var(--muted)] mt-10">© 2026 IGRIS Technologies</p>
        </div>
      </footer>
    </div>
  )
}
