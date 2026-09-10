import { useState, useCallback } from 'react'

/* ── Field Definitions ──────────────────────────────────────────────────────
   Grouped into 4 clinical sections matching the original Messidor dataset.
   Each entry: { id, label, hint, min, max, step, placeholder }
   ──────────────────────────────────────────────────────────────────────── */

const SECTIONS = [
  {
    id: 'quality',
    title: 'Image Quality',
    description: 'Assessment of the retinal fundus image',
    icon: (
      // Minimal line-style eye icon
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
        />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
    fields: [
      {
        id: 'quality',
        label: 'Image Quality',
        hint: 'Binary assessment — 0 (low quality) or 1 (sufficient quality)',
        min: 0, max: 1, step: 1, placeholder: '0 or 1',
      },
      {
        id: 'pre_screening',
        label: 'Pre-screening Result',
        hint: 'Severe retinal abnormality detected — 0 (no) or 1 (yes)',
        min: 0, max: 1, step: 1, placeholder: '0 or 1',
      },
    ],
  },
  {
    id: 'ma',
    title: 'Microaneurysm Detections',
    description: 'Lesion counts at six confidence thresholds (MA1 → MA6)',
    icon: (
      // Minimal scatter/dots icon
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="4" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="8" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="7" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
    fields: [
      { id: 'ma1', label: 'MA at threshold 1', hint: 'Detection count ≥ 0', min: 0, step: 1, placeholder: 'e.g. 22' },
      { id: 'ma2', label: 'MA at threshold 2', hint: 'Detection count ≥ 0', min: 0, step: 1, placeholder: 'e.g. 22' },
      { id: 'ma3', label: 'MA at threshold 3', hint: 'Detection count ≥ 0', min: 0, step: 1, placeholder: 'e.g. 22' },
      { id: 'ma4', label: 'MA at threshold 4', hint: 'Detection count ≥ 0', min: 0, step: 1, placeholder: 'e.g. 22' },
      { id: 'ma5', label: 'MA at threshold 5', hint: 'Detection count ≥ 0', min: 0, step: 1, placeholder: 'e.g. 19' },
      { id: 'ma6', label: 'MA at threshold 6', hint: 'Detection count ≥ 0', min: 0, step: 1, placeholder: 'e.g. 18' },
    ],
  },
  {
    id: 'exudate',
    title: 'Exudate Detections',
    description: 'Bright lesion counts at eight confidence thresholds (EX1 → EX8)',
    icon: (
      // Minimal grid/matrix icon
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="2" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
    fields: [
      { id: 'exudate1', label: 'Exudate at threshold 1', hint: 'Detection count ≥ 0', min: 0, step: 0.01, placeholder: 'e.g. 0' },
      { id: 'exudate2', label: 'Exudate at threshold 2', hint: 'Detection count ≥ 0', min: 0, step: 0.01, placeholder: 'e.g. 0' },
      { id: 'exudate3', label: 'Exudate at threshold 3', hint: 'Detection count ≥ 0', min: 0, step: 0.01, placeholder: 'e.g. 0' },
      { id: 'exudate4', label: 'Exudate at threshold 4', hint: 'Detection count ≥ 0', min: 0, step: 0.01, placeholder: 'e.g. 0' },
      { id: 'exudate5', label: 'Exudate at threshold 5', hint: 'Detection count ≥ 0', min: 0, step: 0.01, placeholder: 'e.g. 0' },
      { id: 'exudate6', label: 'Exudate at threshold 6', hint: 'Detection count ≥ 0', min: 0, step: 0.01, placeholder: 'e.g. 0' },
      { id: 'exudate7', label: 'Exudate at threshold 7', hint: 'Detection count ≥ 0', min: 0, step: 0.01, placeholder: 'e.g. 0' },
      { id: 'exudate8', label: 'Exudate at threshold 8', hint: 'Detection count ≥ 0', min: 0, step: 0.01, placeholder: 'e.g. 0' },
    ],
  },
  {
    id: 'anatomical',
    title: 'Anatomical Measurements',
    description: 'Normalised spatial measurements from the fundus image',
    icon: (
      // Minimal ruler/measure icon
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M2 11L11 2L14 5L5 14L2 11Z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
        />
        <path d="M5.5 8.5L7.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M7.5 10.5L9.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    fields: [
      {
        id: 'macula_opticdisc_distance',
        label: 'Macula–optic disc distance',
        hint: 'Euclidean distance, normalised 0–1',
        min: 0, max: 1, step: 0.001, placeholder: 'e.g. 0.600',
      },
      {
        id: 'opticdisc_diameter',
        label: 'Optic disc diameter',
        hint: 'Diameter, normalised 0–1',
        min: 0, max: 1, step: 0.001, placeholder: 'e.g. 0.100',
      },
    ],
  },
]

// Flat list of all field IDs for building initial state
const ALL_FIELD_IDS = SECTIONS.flatMap((s) => s.fields.map((f) => f.id))

const initialValues = Object.fromEntries(ALL_FIELD_IDS.map((id) => [id, '']))
const initialTouched = Object.fromEntries(ALL_FIELD_IDS.map((id) => [id, false]))

/* ── Validation ────────────────────────────────────────────── */
function validateField(id, value, fieldDef) {
  if (value === '' || value === null || value === undefined) return 'This field is required'
  const num = parseFloat(value)
  if (isNaN(num)) return 'Must be a valid number'
  if (fieldDef.min !== undefined && num < fieldDef.min)
    return `Must be ≥ ${fieldDef.min}`
  if (fieldDef.max !== undefined && num > fieldDef.max)
    return `Must be ≤ ${fieldDef.max}`
  return null
}

function validateAll(values) {
  const errors = {}
  SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      const err = validateField(field.id, values[field.id], field)
      if (err) errors[field.id] = err
    })
  })
  return errors
}

/* ── Field Component ────────────────────────────────────────── */
function FormField({ field, value, onChange, onBlur, error, touched, disabled }) {
  const hasError = touched && error
  return (
    <div className="field">
      <label className="field-label" htmlFor={`field-${field.id}`}>
        {field.label}
      </label>
      {field.hint && <span className="field-hint">{field.hint}</span>}
      <input
        id={`field-${field.id}`}
        name={field.id}
        type="number"
        className={`input${hasError ? ' is-invalid' : ''}`}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        onBlur={() => onBlur(field.id)}
        min={field.min}
        max={field.max}
        step={field.step ?? 'any'}
        placeholder={field.placeholder}
        required
        disabled={disabled}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError ? `err-${field.id}` : undefined}
      />
      {hasError && (
        <span id={`err-${field.id}`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

/* ── Section Component ──────────────────────────────────────── */
function FormSection({ section, values, onChange, onBlur, errors, touched, disabled }) {
  const isMaOrExudate = section.id === 'ma' || section.id === 'exudate'
  const gridClass = isMaOrExudate ? 'field-grid-3' : 'field-grid'

  return (
    <div className="form-card">
      <div className="section-header">
        <span className="section-icon">{section.icon}</span>
        <div>
          <div className="section-title">{section.title}</div>
          {section.description && (
            <div className="section-desc">{section.description}</div>
          )}
        </div>
      </div>
      <div className={gridClass}>
        {section.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={onChange}
            onBlur={onBlur}
            error={errors[field.id]}
            touched={touched[field.id]}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

/* ── RiskForm ────────────────────────────────────────────────── */
export default function RiskForm({ onResult, onLoading, isLoading, backendReady }) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState(initialTouched)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errors = validateAll(values)
  const isValid = Object.keys(errors).length === 0

  const handleChange = useCallback((id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleBlur = useCallback((id) => {
    setTouched((prev) => ({ ...prev, [id]: true }))
  }, [])

  const handleReset = () => {
    setValues(initialValues)
    setTouched(initialTouched)
    setSubmitAttempted(false)
    onResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitAttempted(true)

    // Mark all fields as touched so errors are visible
    setTouched(Object.fromEntries(ALL_FIELD_IDS.map((id) => [id, true])))

    if (!isValid) return

    onLoading(true)
    try {
      const { predictRisk } = await import('../api/predict.js')
      const result = await predictRisk(values)
      onResult({ data: result, error: null })
    } catch (err) {
      onResult({ data: null, error: err.message })
    } finally {
      onLoading(false)
    }
  }

  // Which errors to show: touched per-field, or all on submit attempt
  const displayTouched = submitAttempted
    ? Object.fromEntries(ALL_FIELD_IDS.map((id) => [id, true]))
    : touched

  /* Desktop: MA and Exudate sections in a two-column grid */
  const [qualitySection, maSection, exudateSection, anatomicalSection] = SECTIONS

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Retinopathy risk assessment form">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

        {/* Quality */}
        <FormSection
          section={qualitySection}
          values={values}
          onChange={handleChange}
          onBlur={handleBlur}
          errors={errors}
          touched={displayTouched}
          disabled={isLoading}
        />

        {/* MA + Exudate — side by side on desktop */}
        <div className="two-col-sections">
          <FormSection
            section={maSection}
            values={values}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={displayTouched}
            disabled={isLoading}
          />
          <FormSection
            section={exudateSection}
            values={values}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={displayTouched}
            disabled={isLoading}
          />
        </div>

        {/* Anatomical */}
        <FormSection
          section={anatomicalSection}
          values={values}
          onChange={handleChange}
          onBlur={handleBlur}
          errors={errors}
          touched={displayTouched}
          disabled={isLoading}
        />

        {/* Actions */}
        <div className="form-actions form-actions-sticky">
          <button
            type="submit"
            id="btn-assess-risk"
            className="btn btn-primary btn-lg"
            disabled={isLoading || !backendReady}
            aria-busy={isLoading}
            title={!backendReady ? 'Please wait — prediction system is starting…' : undefined}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Assessing…
              </>
            ) : !backendReady ? (
              'System Starting…'
            ) : (
              'Assess Risk'
            )}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            disabled={isLoading}
          >
            Clear form
          </button>
        </div>
      </div>
    </form>
  )
}
