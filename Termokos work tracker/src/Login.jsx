import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr('Email ose fjalëkalim i pasaktë.')
  }
  return (
    <form className="login" onSubmit={submit}>
      <h1>Orari i punës</h1>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Fjalëkalimi<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {err && <p className="err">{err}</p>}
      <button className="p">Hyr</button>
    </form>
  )
}
