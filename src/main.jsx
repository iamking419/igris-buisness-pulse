import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '../css/styles.css'

const legacySelectors = [
  '#survey-stage',
  '#admin-login',
  '#admin-dashboard',
  '#q-counter',
  '#menu-toggle',
  '#btn-export',
  '#response-detail',
]

const shouldSkipReactMount = legacySelectors.some((selector) => document.querySelector(selector))

if (shouldSkipReactMount) {
  console.log('IGRIS: legacy page markup detected — skipping React mount to preserve the existing frontend UI')
} else {
  const rootEl = document.getElementById('root') || (() => {
    const el = document.createElement('div')
    el.id = 'root'
    document.body.appendChild(el)
    return el
  })()

  createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}
