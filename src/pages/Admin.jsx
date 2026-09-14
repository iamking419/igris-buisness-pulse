import React from 'react'

export default function Admin(){
  return (
    <div>
      <div id="admin-login" className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <img src="/assets/igris-logo.png" alt="IGRIS Technologies" className="h-8 w-auto" />
            <span className="font-semibold tracking-tight text-[15px]">IGRIS</span>
          </div>
          <p className="mono-tag text-xs text-[var(--muted)] mb-1">IGRIS BUSINESS PULSE</p>
          <h1 className="text-2xl font-medium mb-8">Admin</h1>
          <form id="login-form">
            <label htmlFor="password-input" className="block text-sm text-[var(--muted)] mb-2">Password</label>
            <input id="password-input" type="password" required className="w-full border border-[var(--line)] focus-visible:border-[var(--ink)] px-4 py-3.5 text-[15px] mb-2" />
            <p id="login-error" className="hidden text-sm text-[var(--ink)] mb-4">Incorrect password.</p>
            <button type="submit" className="w-full bg-[var(--ink)] text-white px-6 py-3.5 text-sm hover:opacity-90 mt-4">Access Research</button>
          </form>
        </div>
      </div>
    </div>
  )
}
