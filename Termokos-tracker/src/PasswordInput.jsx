import { useState } from 'react'

const Eye = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
)

// Password field with a button to show / hide what has been typed.
export default function PasswordInput({ value, onChange, autoComplete, required }) {
  const [show, setShow] = useState(false)
  return (
    <div className="pw">
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} required={required} />
      <button type="button" className="eye" onClick={() => setShow(!show)} aria-pressed={show}
        aria-label={show ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}>
        <Eye off={show} />
      </button>
    </div>
  )
}