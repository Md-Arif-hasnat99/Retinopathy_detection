/**
 * BackendStatusBanner — shows a slim banner under the header while the
 * Render backend is waking up, and confirms when it is ready.
 *
 * Props:
 *   status — 'starting' | 'ready' | 'unavailable'
 *
 * The banner is hidden entirely once the backend is confirmed ready
 * (after a short animation delay so the user can read the confirmation).
 */

import { useState, useEffect } from 'react'

export default function BackendStatusBanner({ status }) {
  // Keep the banner visible for 3 s after becoming ready, then hide it.
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (status === 'ready') {
      const id = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(id)
    }
    // Reset visibility if status changes back (edge case / HMR)
    setVisible(true)
  }, [status])

  if (!visible) return null

  let bannerClass = 'backend-banner'
  let icon = null
  let message = ''

  if (status === 'starting') {
    bannerClass += ' backend-banner--starting'
    icon = (
      <span className="backend-banner-spinner" aria-hidden="true" />
    )
    message = 'Starting prediction system…'
  } else if (status === 'ready') {
    bannerClass += ' backend-banner--ready'
    icon = (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 7l2.5 2.5L10 5" stroke="currentColor" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
    message = 'Prediction system ready ✓'
  } else {
    // unavailable
    bannerClass += ' backend-banner--unavailable'
    icon = (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="7" cy="10" r="0.6" fill="currentColor" />
      </svg>
    )
    message =
      'Prediction service is currently unavailable. Please try again later.'
  }

  return (
    <div className={bannerClass} role="status" aria-live="polite">
      <span className="backend-banner-icon">{icon}</span>
      <span className="backend-banner-text">{message}</span>
    </div>
  )
}
