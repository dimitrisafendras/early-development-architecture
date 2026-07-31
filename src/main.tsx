import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
// The Liquid Glass material, imported once for the whole app — the components
// that use it are no longer local, so no component pulls its own stylesheet in.
import '@dimitrisafendras/liquid-glass/styles.css'
import { seedTestData, clearTestData } from './lib/devSeed'

// Dev-only test-data helpers. Visit `?seed` to load a backlog of tummy/feed
// data (or `?unseed` to clear), then the URL param is stripped and the page
// reloads. Also exposed on `window` for the console.
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).seedTestData = seedTestData
  ;(window as unknown as Record<string, unknown>).clearTestData = clearTestData
  const params = new URLSearchParams(window.location.search)
  if (params.has('seed') || params.has('unseed')) {
    if (params.has('unseed')) clearTestData()
    else seedTestData()
    params.delete('seed')
    params.delete('unseed')
    const qs = params.toString()
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''))
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Register the service worker for offline / installable PWA support.
// Scope is the Vite base path so it works under the GitHub Pages sub-path.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}
