import { useState } from 'react'
import { supabase } from './supabase'
import PasswordInput from './PasswordInput'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'forgot'
  const [email, setEmail] = useState(''), [password, setPassword] = useState('')
  const [err, setErr] = useState(''), [info, setInfo] = useState('')

  const login = async (e) => {
    e.preventDefault(); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr(error.message === 'Invalid login credentials' ? 'Email ose fjalëkalim i pasaktë.' : error.message)
  }
  const forgot = async (e) => {
    e.preventDefault(); setErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` })
    if (error) setErr(error.message)
    else setInfo('Nëse ky email ekziston, do të merrni një link për të vendosur fjalëkalim të ri.')
  }

  if (mode === 'forgot') return (
    <form className="login" onSubmit={forgot}>
      <h1>Harrova fjalëkalimin</h1>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      {err && <p className="err">{err}</p>}
      {info && <p>{info}</p>}
      <button className="p">Dërgo linkun</button>
      <button type="button" className="x" onClick={() => { setMode('login'); setInfo('') }}>Kthehu te hyrja</button>
    </form>
  )
  return (
    <form className="login" onSubmit={login}>
      <h1>Orari i punës</h1>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Fjalëkalimi<PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
      {err && <p className="err">{err}</p>}
      <button className="p">Hyr</button>
      <button type="button" className="x" onClick={() => setMode('forgot')}>Harrova fjalëkalimin</button>
    </form>
  )
}