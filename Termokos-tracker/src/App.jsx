import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import Login from './Login'
import Sheet from './Sheet'
import History from './History'
import Viewer from './Viewer'
import Account from './Account'

function useSession(onRecovery) {
  const [s, setS] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setS(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, x) => {
      setS(x)
      if (event === 'PASSWORD_RECOVERY') onRecovery()
    })
    return () => subscription.unsubscribe()
  }, [])
  return s
}

function Shell() {
  return (
    <div className="wrap">
      <div className="bar np">
        <h1>Orari i punës</h1>
        <Link to="/">Muaji aktual</Link><Link to="/history">Historiku</Link><Link to="/account">Fjalëkalimi</Link>
        <button onClick={() => supabase.auth.signOut()}>Dil</button>
      </div>
      <Routes>
        <Route path="/" element={<Sheet />} />
        <Route path="/m/:y/:m" element={<Sheet />} />
        <Route path="/history" element={<History />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  )
}

export default function App() {
  // The reset email link opens the app on /reset
  const [recovery, setRecovery] = useState(() => location.pathname === '/reset' || location.hash.includes('type=recovery'))
  const s = useSession(() => setRecovery(true))
  const nav = useNavigate()
  const leave = () => { setRecovery(false); nav('/') }

  if (recovery) {
    if (s === undefined) return null
    if (!s) return (
      <div className="login">
        <h1>Linku ka skaduar</h1>
        <p>Ky link nuk është më i vlefshëm. Kërkoni një të ri nga faqja e hyrjes.</p>
        <button className="p" onClick={leave}>Te hyrja</button>
      </div>
    )
    return <Account reset onDone={leave} />
  }
  return (
    <Routes>
      <Route path="/view/:token" element={<Viewer />} />
      <Route path="*" element={s === undefined ? null : s ? <Shell /> : <Login />} />
    </Routes>
  )
}