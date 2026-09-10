/**
 * predict.js — API wrapper for the /predict endpoint.
 *
 * Reads VITE_API_URL from environment variables (set in .env).
 * Falls back to localhost:8000 in development if the variable is unset.
 */

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8000'

/**
 * Send 18 numeric features to the backend /predict endpoint.
 *
 * @param {Object} formData — key/value pairs matching the Pydantic schema
 * @returns {Promise<{ prediction: number, confidence: number, label: string }>}
 * @throws {Error} with a user-friendly message on HTTP or network errors
 */
export async function predictRisk(formData) {
  // Convert string values from form inputs to floats
  const payload = Object.fromEntries(
    Object.entries(formData).map(([key, val]) => [key, parseFloat(val)])
  )

  let response
  try {
    response = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (networkError) {
    throw new Error(
      'Unable to reach the assessment server. Please check your network connection and try again.'
    )
  }

  if (!response.ok) {
    let detail = `Server error (${response.status})`
    try {
      const errorBody = await response.json()
      if (errorBody?.detail) {
        detail = Array.isArray(errorBody.detail)
          ? errorBody.detail.map((e) => e.msg ?? e).join('; ')
          : String(errorBody.detail)
      }
    } catch {
      // use the default detail string
    }
    throw new Error(detail)
  }

  return response.json()
}
