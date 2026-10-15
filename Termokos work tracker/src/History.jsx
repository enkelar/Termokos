import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabase'
import { MONTHS } from './lib'

export default function History() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    supabase.from('reports').select('id,year,month,closed_at').eq('status', 'closed')
      .order('year', { ascending: false }).order('month', { ascending: false }).then(({ data }) => setRows(data || []))
  }, [])
  if (!rows) return <p>Duke ngarkuar…</p>
  return (
    <div className="hist">
      <h2>Historiku i raporteve</h2>
      {!rows.length && <p>Ende nuk ka raporte të mbyllura. Kur mbyllni një muaj, ruhet këtu.</p>}
      <ul>{rows.map((r) => (
        <li key={r.id}>
          <b>{MONTHS[r.month - 1]} {r.year}</b>
          <span>mbyllur më {new Date(r.closed_at).toLocaleDateString('sq-AL')}</span>
          <Link to={`/m/${r.year}/${r.month}`}>Hap</Link>
        </li>
      ))}</ul>
    </div>
  )
}
