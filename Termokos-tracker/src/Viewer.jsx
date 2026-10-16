import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from './supabase'
import Grid, { Head } from './Grid'
import { MONTHS } from './lib'

// Public page: no login, read-only. Data comes only through the get_shared_report function.
export default function Viewer() {
  const { token } = useParams()
  const [d, setD] = useState(undefined)
  useEffect(() => { supabase.rpc('get_shared_report', { p_token: token }).then(({ data }) => setD(data)) }, [token])
  if (d === undefined) return <p className="wrap">Duke ngarkuar…</p>
  if (!d) return <p className="wrap">Ky link nuk është i vlefshëm.</p>
  const hours = Object.fromEntries(d.entries.map((e) => [`${e.worker_id}:${e.day}`, e.hours]))
  const extras = Object.fromEntries((d.extras || []).map((x) => [`${x.worker_id}:${x.field}`, x.value]))
  return (
    <div className="wrap">
      <div className="note np">Po shikoni këtë raport vetëm për lexim.</div>
      <div className="sheet">
        <Head team={d.team} department={d.department} year={d.year} month={d.month - 1} MONTHS={MONTHS} />
        <Grid year={d.year} month={d.month - 1} workers={d.workers} hours={hours} extras={extras} editable={false} />
        <div className="sign">
          {[['Përgatitur nga', d.prepared_by], ['Kontrolloi', d.checked_by], ['Aprovoi', d.approved_by]].map(([l, v]) => (
            <div key={l}><label>{l}</label><div className="line">{v || '\u00a0'}</div></div>
          ))}
        </div>
      </div>
      <div className="add np"><button className="p" onClick={() => window.print()}>Ruaj si PDF</button></div>
    </div>
  )
}