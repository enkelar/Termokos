import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import PasswordInput from './PasswordInput'

// Used for both "change password" (/account) and the page opened from the reset email (/reset).
export default function Account({ reset }) {
  const nav = useNavigate()
  const [pw, setPw] = useState(''), [pw2, setPw2] = useState('')
  const [err, setErr] = useState(''), [ok, setOk] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (pw.length < 8) return setErr('Fjalëkalimi duhet të ketë të paktën 8 karaktere.')
    if (pw !== pw2) return setErr('Fjalëkalimet nuk përputhen.')
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) return setErr(error.message)
    setOk(true); setTimeout(() => nav('/'), 1200)
  }
  return (
    <form className="login" onSubmit={submit}>
      <h1>{reset ? 'Fjalëkalim i ri' : 'Ndrysho fjalëkalimin'}</h1>
      <label>Fjalëkalimi i ri<PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required /></label>
      <label>Përsërit fjalëkalimin<PasswordInput value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" required /></label>
      {err && <p className="err">{err}</p>}
      {ok && <p>Fjalëkalimi u ndryshua.</p>}
      <button className="p">Ruaj</button>
    </form>
  )
}