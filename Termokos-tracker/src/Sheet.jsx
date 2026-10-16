import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import Grid, { Head } from './Grid'
import { MONTHS, daysIn } from './lib'


export default function Sheet() {
  const p = useParams(), nav = useNavigate(), now = new Date()
  const year = p.y ? +p.y : now.getFullYear()
  const month = p.m ? +p.m - 1 : now.getMonth()

  const [team, setTeam] = useState(null), [rep, setRep] = useState(null)
  const [workers, setWorkers] = useState([]), [hours, setHours] = useState({}), [extras, setExtras] = useState({})
  const [name, setName] = useState(''), [msg, setMsg] = useState('')
  const locked = rep?.status === 'closed'
  const [preview, setPreview] = useState(false)

  const todayLabel = MONTHS[month]

  const load = useCallback(async () => {
    const { data: t } = await supabase.from('teams').select('*').maybeSingle()
    if (!t) { setMsg('Ky llogari nuk ka ekip. Kontaktoni administratorin.'); return }
    setTeam(t)
    let { data: r } = await supabase.from('reports').select('*')
      .eq('team_id', t.id).eq('year', year).eq('month', month + 1).maybeSingle()
    if (!r) { // first visit to a month creates its draft report
      ({ data: r } = await supabase.from('reports')
        .insert({ team_id: t.id, year, month: month + 1, prepared_by: t.lead_name }).select().single())
    }
    setRep(r)
    const { data: ws } = await supabase.from('workers').select('*').eq('team_id', t.id).eq('active', true)
      .order('sort').order('created_at')
    setWorkers(r.status === 'closed' ? r.snapshot.workers : ws)
    const { data: es } = await supabase.from('entries').select('*').eq('report_id', r.id)
    setHours(Object.fromEntries(es.map((e) => [`${e.worker_id}:${e.day}`, e.hours])))
    const { data: xs } = await supabase.from('report_extras').select('*').eq('report_id', r.id)
    setExtras(Object.fromEntries((xs || []).map((x) => [`${x.worker_id}:${x.field}`, x.value])))
  }, [year, month])
  useEffect(() => { load() }, [load])


  const commit = async (wid, d) => {
    const v = hours[`${wid}:${d}`], key = { report_id: rep.id, worker_id: wid, day: d }
    if (v === '' || v == null) await supabase.from('entries').delete().match(key)
    else await supabase.from('entries').upsert({ ...key, hours: Number(v) }, { onConflict: 'report_id,worker_id,day' })
  }
  const commitExtra = async (wid, field) => {
    const v = extras[`${wid}:${field}`], key = { report_id: rep.id, worker_id: wid, field }
    if (v === '' || v == null) await supabase.from('report_extras').delete().match(key)
    else await supabase.from('report_extras').upsert({ ...key, value: Number(v) }, { onConflict: 'report_id,worker_id,field' })
  }
  const addWorker = async () => {
    if (!name.trim()) return
    await supabase.from('workers').insert({ team_id: team.id, name: name.trim() })
    setName(''); load()
  }
  const removeWorker = async (w) => {
    if (!confirm(`Të hiqet ${w.name}? Raportet e mbyllura nuk ndryshojnë.`)) return
    await supabase.from('workers').update({ active: false }).eq('id', w.id); load()
  }
  const fill = async () => {
    const rows = [], next = { ...hours }
    workers.forEach((w) => {
      for (let d = 1; d <= daysIn(year, month); d++) {
        const k = `${w.id}:${d}`, wd = new Date(year, month, d).getDay(), v = wd % 6 ? 8 : 0 // weekdays 8, weekends 0
        if (next[k] === undefined || next[k] === '') { next[k] = v; rows.push({ report_id: rep.id, worker_id: w.id, day: d, hours: v }) }
      }
    })
    if (rows.length) await supabase.from('entries').upsert(rows, { onConflict: 'report_id,worker_id,day' })
    setHours(next)
  }
  const close = async () => {
    if (!confirm(`Të mbyllet ${MONTHS[month]} ${year}? Raporti ruhet në historik dhe kyçet.`)) return
    const { data } = await supabase.from('reports').update({
      status: 'closed', closed_at: new Date().toISOString(),
      snapshot: { workers: workers.map(({ id, name }) => ({ id, name })) },
    }).eq('id', rep.id).select().single()
    setRep(data)
  }
  const reopen = async () => {
    await supabase.from('reports').update({ status: 'draft', closed_at: null, snapshot: null }).eq('id', rep.id)
    load()
  }
  const saveSign = (f, v) => supabase.from('reports').update({ [f]: v }).eq('id', rep.id)
  const go = (n) => { const d = new Date(year, month + n, 1); nav(`/m/${d.getFullYear()}/${d.getMonth() + 1}`) }
  const share = async () => {
    const url = `${location.origin}/view/${rep.share_token}`
    try { await navigator.clipboard.writeText(url); setMsg('Linku u kopjua.') } catch { prompt('Kopjoni linkun:', url) }
  }


  if (msg && !team) return <p>{msg}</p>
  if (!rep) return <p>Duke ngarkuar…</p>
  return (
    <>
      <div className="bar np">
        <button onClick={() => go(-1)} aria-label="Muaji i kaluar">‹</button>
        <button onClick={() => nav('/')}>{todayLabel}</button>
        <button onClick={() => go(1)} aria-label="Muaji tjetër">›</button>
        <button onClick={share}>Kopjo linkun (vetëm shikim)</button>
        <button onClick={() => setPreview(!preview)}>{preview ? 'Ndrysho' : 'Shiko'}</button>
        <button className="p" onClick={() => window.print()}>Ruaj si PDF</button>
        {msg && <span>{msg}</span>}
      </div>
      {locked && <div className="note np">Ky muaj është mbyllur. Rihapeni për ta ndryshuar.</div>}
      <div className="sheet">
        <Head team={team.name} department={team.department} year={year} month={month} MONTHS={MONTHS} />
        <Grid year={year} month={month} workers={workers} hours={hours} editable={!locked && !preview}
          extras={extras} onExtraChange={(k, v) => setExtras((x) => ({ ...x, [k]: v }))} onExtraCommit={commitExtra}
          onChange={(k, v) => setHours((h) => ({ ...h, [k]: v }))} onCommit={commit} onRemove={removeWorker} />
        <div className="sign">
          {[['prepared_by', 'Përgatitur nga'], ['checked_by', 'Kontrolloi'], ['approved_by', 'Aprovoi']].map(([f, l]) => (
            <div key={f}><label>{l}</label>
              <input value={rep[f] ?? ''} readOnly={locked || preview}
                onChange={(e) => setRep({ ...rep, [f]: e.target.value })} onBlur={(e) => saveSign(f, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <div className="add np">
        {preview ? null : !locked ? <>
          <input className="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Inicialet, p.sh. A. B." maxLength={20} />
          <button onClick={addWorker}>Shto punëtor</button>
          <button onClick={fill}>Plotëso (8 orë, fundjava 0)</button>
          <button className="p" onClick={close}>Mbyll muajin</button>
        </> : <button onClick={reopen}>Rihap muajin</button>}
      </div>
    </>
  )
}