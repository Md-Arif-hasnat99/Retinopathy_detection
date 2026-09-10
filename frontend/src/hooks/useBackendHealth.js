/**
 * useBackendHealth — polls GET /health until the Render backend wakes up.
 *
 * States:
 *   'starting'     — initial / still retrying
 *   'ready'        — /health returned 200
 *   'unavailable'  — exhausted all retries
 *
 * The hook fires once on mount and never sends patient data.
 */

import { useState, useEffect, useRef } from 'react'

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8000'

const MAX_RETRIES = 12       // 12 attempts × ~5 s ≈ ~60 s total window
const RETRY_DELAY_MS = 5000  // 5 seconds between retries
const REQUEST_TIMEOUT_MS = 8000 // individual request timeout

/**
 * @returns {{ backendStatus: 'starting'|'ready'|'unavailable' }}
 */
export function useBackendHealth() {
  const [backendStatus, setBackendStatus] = useState('starting')
  const attemptsRef = useRef(0)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    async function checkHealth() {
      if (!mountedRef.current) return

      attemptsRef.current += 1

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(
          () => controller.abort(),
          REQUEST_TIMEOUT_MS
        )

        const response = await fetch(`${BASE_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!mountedRef.current) return

        if (response.ok) {
          console.info('[Health] Backend is ready ✓')
          setBackendStatus('ready')
          return
        }

        // Non-2xx response — treat same as network error and retry
        console.warn(
          `[Health] Attempt ${attemptsRef.current}: HTTP ${response.status}`
        )
      } catch (err) {
        if (!mountedRef.current) return
        const reason =
          err.name === 'AbortError' ? 'timeout' : err.message
        console.warn(
          `[Health] Attempt ${attemptsRef.current} failed (${reason})`
        )
      }

      if (!mountedRef.current) return

      if (attemptsRef.current >= MAX_RETRIES) {
        console.error('[Health] Backend unavailable after maximum retries.')
        setBackendStatus('unavailable')
        return
      }

      // Schedule next retry
      timerRef.current = setTimeout(checkHealth, RETRY_DELAY_MS)
    }

    checkHealth()

    return () => {
      mountedRef.current = false
      clearTimeout(timerRef.current)
    }
  }, []) // run once on mount

  return { backendStatus }
}
