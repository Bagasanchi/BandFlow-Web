import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { createWork, getWorkers, type ApiWorker } from '../api'
import Avatar from '../components/Avatar'
import { PageHeader, Spinner } from '../components/ui'
import { errorText } from '../format'
import { useSession } from '../session'

export default function AssignWork() {
  const { profile, refreshWork } = useSession()
  const navigate = useNavigate()
  const [workers, setWorkers] = useState<ApiWorker[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [brief, setBrief] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getWorkers()
      .then((result) => {
        setWorkers(result)
        setSelectedId(result[0]?.id ?? '')
      })
      .catch((error) => setErrorMessage(errorText(error, 'Unable to load workers.')))
      .finally(() => setIsLoading(false))
  }, [])

  const selected = workers.find((worker) => worker.id === selectedId)
  const title = brief.trim().split('\n')[0].trim()

  const assign = async () => {
    if (!title || !selected) return
    setIsAssigning(true)
    setErrorMessage('')
    try {
      await createWork({ title, priority: 'Medium', subtasks: [], assignedTo: selected.id })
      await refreshWork()
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to assign the work.'))
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="page page-narrow">
      <PageHeader kicker="SMART ASSIGNMENT" title="Find the right owner" aside={<span style={{ color: 'var(--accent)', fontSize: 24 }}>✦</span>} />

      <section className="hero" style={{ gap: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900 }}>Let the team context do the matching.</h2>
        <p style={{ margin: 0 }}>Describe the work and BandFlow will surface the strongest fit from your team.</p>
        <span className="chip status-done" style={{ alignSelf: 'flex-start', marginTop: 6 }}>● Team availability synced just now</span>
      </section>

      <p className="section-label">THE WORK</p>
      <section className="card form">
        <textarea className="textarea" placeholder="What needs to move forward?" value={brief} onChange={(event) => setBrief(event.target.value)} />
        <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>A sentence or two is enough for a useful recommendation. The first line becomes the task title.</p>
      </section>

      <p className="section-label">RECOMMENDED OWNER</p>
      {isLoading ? <Spinner /> : null}
      {!isLoading && workers.length === 0 ? (
        <section className="card">
          <h2 className="card-title">No worker accounts found</h2>
          <p style={{ margin: '4px 0 0' }}>Create a worker account before assigning work.</p>
        </section>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {workers.map((worker, index) => (
          <button key={worker.id} type="button" className={`select-row${worker.id === selectedId ? ' selected' : ''}`} onClick={() => setSelectedId(worker.id)}>
            <span className="chip" style={{ background: worker.id === selectedId ? 'var(--accent)' : 'var(--input-bg)', color: worker.id === selectedId ? 'var(--accent-text)' : 'var(--body)' }}>0{index + 1}</span>
            <Avatar name={worker.name} size={40} />
            <span style={{ minWidth: 0 }}>
              <strong>{worker.name}</strong>
              <small>{worker.email ?? 'Workspace worker'} · {worker.status ?? 'active'}</small>
            </span>
            <span className="radio" />
          </button>
        ))}
      </div>

      {selected ? (
        <section className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={selected.name} size={44} />
          <div>
            <p className="kicker" style={{ color: 'var(--body)' }}>ASSIGNMENT PREVIEW</p>
            <strong style={{ color: 'var(--title)' }}>{selected.name} will own this work</strong>
            <p style={{ margin: '2px 0 0', fontSize: 13 }}>They'll get the brief, priority, and a clear starting point.</p>
          </div>
        </section>
      ) : null}

      {errorMessage ? <p className="message-error">{errorMessage}</p> : null}
      <button type="button" className="btn btn-primary btn-block" style={{ minHeight: 54 }} disabled={!selected || !title || isAssigning} onClick={() => void assign()}>
        {isAssigning ? <Spinner /> : selected ? `Assign to ${selected.name}  →` : 'Select a worker'}
      </button>
      <p className="footer-note" style={{ marginTop: 0 }}>Signed in as {profile?.fullName}</p>
    </div>
  )
}
