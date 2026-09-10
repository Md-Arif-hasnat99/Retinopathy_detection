import { useState } from 'react'
import RiskForm from './components/RiskForm.jsx'
import ResultCard from './components/ResultCard.jsx'

export default function App() {
  const [result, setResult] = useState(null)   // { data, error } | null
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="app-header">
        <div className="container">
          {/* Retina/eye icon */}
          <span className="header-icon" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="#4A7C6F" strokeWidth="1.5" opacity="0.25" />
              <path
                d="M4 18C4 18 9 9 18 9C27 9 32 18 32 18C32 18 27 27 18 27C9 27 4 18 4 18Z"
                stroke="#4A7C6F" strokeWidth="1.5" strokeLinejoin="round"
              />
              <circle cx="18" cy="18" r="4.5" stroke="#4A7C6F" strokeWidth="1.5" />
              <circle cx="18" cy="18" r="1.5" fill="#4A7C6F" />
            </svg>
          </span>

          <div>
            <div className="header-eyebrow">Screening Tool</div>
            <h1 className="header-title">Retinopathy Risk Assessment</h1>
            <p className="header-subtitle">
              Enter retinal image measurements below to receive an automated
              risk screening result. All 18 fields are required.
            </p>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="app-main" id="main-content">
        <div className="container">
          <div className="app-layout">
            {/* Result card appears above (or below on mobile) the form
                after submission — placed first in DOM for screen readers */}
            {(result || isLoading) && (
              <ResultCard result={result} isLoading={isLoading} />
            )}

            <RiskForm
              onResult={setResult}
              onLoading={setIsLoading}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      {/* ── Footer / Disclaimer ─────────────────────────────── */}
      <footer className="app-footer">
        <div className="container">
          <p className="disclaimer">
            <strong>Screening aid only.</strong> This tool uses a machine learning
            model trained on the Messidor dataset and is intended solely as a
            screening aid to assist trained medical professionals. It does{' '}
            <strong>not</strong> constitute a medical diagnosis, and its output
            should not replace examination by a qualified ophthalmologist.
            Results may vary depending on image quality and input accuracy.
          </p>
        </div>
      </footer>
    </div>
  )
}
