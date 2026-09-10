/**
 * ResultCard — displays the prediction result with a risk badge,
 * confidence progress bar, and a plain-language explanation.
 *
 * Props:
 *   result — null | { data: PredictResponse | null, error: string | null }
 *   isLoading — boolean
 */

export default function ResultCard({ result, isLoading }) {
  /* ── Loading ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="loading-card" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p className="loading-text">Running assessment — this takes just a moment…</p>
      </div>
    )
  }

  /* ── Nothing yet ─────────────────────────────────────────── */
  if (!result) return null

  /* ── Error ───────────────────────────────────────────────── */
  if (result.error) {
    return (
      <div className="error-card" role="alert">
        <span className="error-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="14" r="0.75" fill="currentColor" />
          </svg>
        </span>
        <div>
          <div className="error-title">Assessment could not be completed</div>
          <p className="error-message">{result.error}</p>
        </div>
      </div>
    )
  }

  /* ── Success ─────────────────────────────────────────────── */
  const { prediction, confidence, label } = result.data
  const isHigh = prediction === 1
  const riskClass = isHigh ? 'high' : 'low'
  const confidencePct = Math.round(confidence * 100)

  const explanation = isHigh
    ? `The model detected patterns associated with diabetic retinopathy in the provided retinal image measurements. A higher microaneurysm or exudate count across multiple thresholds contributed to this assessment. We recommend prompt follow-up with an ophthalmologist for a comprehensive evaluation.`
    : `The provided retinal image measurements show characteristics consistent with a lower retinopathy risk profile. Microaneurysm and exudate counts appear within ranges typically associated with healthy retinal tissue. Routine monitoring and regular eye examinations remain important for ongoing care.`

  return (
    <div className="result-card" role="region" aria-label="Assessment result" aria-live="polite">
      {/* Header */}
      <div className="result-header">
        <div className="result-title-group">
          <div className="result-label">Assessment result</div>
          <h2 className="result-prediction">{label}</h2>
          <span className={`risk-badge risk-badge--${riskClass}`}>
            <span className="risk-badge-dot" aria-hidden="true" />
            {isHigh ? 'Elevated retinopathy risk' : 'No significant risk indicators'}
          </span>
        </div>

        {/* Icon — subtle checkmark or warning */}
        <span aria-hidden="true" style={{ color: isHigh ? 'var(--color-terra)' : 'var(--color-teal)', marginTop: 4 }}>
          {isHigh ? (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 10v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="16" cy="22" r="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 16.5l4.5 4.5L22 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="confidence-section">
        <div className="confidence-label">
          <span className="confidence-text">Model confidence</span>
          <span className="confidence-pct">{confidencePct}%</span>
        </div>
        <div className="confidence-track" role="progressbar" aria-valuenow={confidencePct} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`confidence-fill confidence-fill--${riskClass}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Plain-language explanation */}
      <div className={`result-explanation result-explanation--${riskClass}`}>
        <p>{explanation}</p>
      </div>
    </div>
  )
}
