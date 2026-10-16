import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { supabase } from './supabase'
import Login from './Login'
import Sheet from './Sheet'
import History from './History'
import Viewer from './Viewer'
import Account from './Account'

function useSession() {
  const [s, setS] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setS(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, x) => setS(x))
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
        <Route path="/reset" element={<Account reset />} />
      </Routes>
    </div>
  )
}

export default function App() {
  const s = useSession()
  return (
    <Routes>
      <Route path="/view/:token" element={<Viewer />} />
      <Route path="*" element={s === undefined ? null : s ? <Shell /> : <Login />} />
    </Routes>
  )
}