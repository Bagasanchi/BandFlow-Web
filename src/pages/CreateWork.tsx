import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { createWork, getWorkers, type ApiWorker, type Priority } from '../api'
import Avatar from '../components/Avatar'
import { PageHeader, Spinner } from '../components/ui'
import { bandDeliveryNotice, errorText, priorityColor } from '../format'
import { useSession } from '../session'

const priorities: Priority[] = ['Low', 'Medium', 'High']

export default function CreateWork() {
  const { refreshWork, showNotice } = useSession()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [projectMode, setProjectMode] = useState<'solo' | 'group'>('solo')
  const [workers, setWorkers] = useState<ApiWorker[]>([])
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true)
  const [subtaskDraft, setSubtaskDraft] = useState('')
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getWorkers()
      .then(setWorkers)
      .catch((error) => setErrorMessage(errorText(error, 'Unable to load workers.')))
      .finally(() => setIsLoadingWorkers(false))
  }, [])

  const selectWorker = (workerId: string) => {
    if (projectMode === 'solo') {
      setSelectedWorkers([workerId])
      return
    }
    setSelectedWorkers((current) => current.includes(workerId) ? current.filter((id) => id !== workerId) : [...current, workerId])
  }

  const setMode = (mode: 'solo' | 'group') => {
    setProjectMode(mode)
    if (mode === 'solo') setSelectedWorkers((current) => current.slice(0, 1))
  }

  const addSubtask = () => {
    const trimmed = subtaskDraft.trim()
    if (!trimmed) return
    setSubtasks((current) => [...current, trimmed])
    setSubtaskDraft('')
  }

  const publish = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || selectedWorkers.length === 0) return
    setIsPublishing(true)
    setErrorMessage('')
    try {
      // One task per selected worker, as in the phone app. Workers are sent by id so two
      // people with the same name can never receive each other's work.
      const results = await Promise.all(selectedWorkers.map((workerId) => createWork({ title: title.trim(), priority, due: dueDate || 'Unscheduled', subtasks, assignedTo: workerId })))
      await refreshWork()
      showNotice(bandDeliveryNotice(results))
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to publish the work.'))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <form className="page page-narrow" onSubmit={(event) => void publish(event)}>
      <PageHeader kicker="NEW WORK" title="Create work" subtitle="Define a task, choose who owns it, and break it into steps." />

      <section className="card form">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" className="input" placeholder="What needs to get done?" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="due">Due date</label>
          <input id="due" className="input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </div>
        <div className="field">
          <span className="label">Priority</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {priorities.map((option) => (
              <button key={option} type="button" className={`select-row${priority === option ? ' selected' : ''}`} style={{ justifyContent: 'center', padding: '10px 8px' }} onClick={() => setPriority(option)}>
                <span className="priority-dot" style={{ background: priorityColor(option) }} />
                <strong style={{ fontSize: 13 }}>{option}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card form">
        <div className="segmented">
          {(['solo', 'group'] as const).map((mode) => (
            <button key={mode} type="button" className={projectMode === mode ? 'selected' : ''} onClick={() => setMode(mode)}>
              {mode === 'solo' ? 'Solo project' : 'Group project'}
            </button>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 13 }}>{projectMode === 'solo' ? 'Choose one worker' : 'Choose everyone who should collaborate'}</p>
        {isLoadingWorkers ? <Spinner /> : null}
        {!isLoadingWorkers && workers.length === 0 ? <p className="empty">No worker accounts yet. Workers appear here after they sign up.</p> : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {workers.map((worker) => (
            <button key={worker.id} type="button" className={`select-row${selectedWorkers.includes(worker.id) ? ' selected' : ''}`} onClick={() => selectWorker(worker.id)}>
              <Avatar name={worker.name} size={36} />
              <span style={{ minWidth: 0 }}>
                <strong>{worker.name}</strong>
                <small>{worker.status ?? 'active'}</small>
              </span>
              <span className="radio" />
            </button>
          ))}
        </div>
      </section>

      <section className="card form">
        <h2 className="card-title">Subtasks</h2>
        {subtasks.length ? (
          <ul className="subtask-list">
            {subtasks.map((item, index) => (
              <li key={`${item}-${index}`}>
                <span style={{ color: 'var(--muted)', fontWeight: 800 }}>{index + 1}</span>
                <span style={{ flex: 1 }}>{item}</span>
                <button type="button" className="icon-button" aria-label={`Remove ${item}`} onClick={() => setSubtasks((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>
              </li>
            ))}
          </ul>
        ) : <p style={{ margin: 0, fontSize: 13 }}>Optional. Without subtasks the whole task is sent to the band as one step.</p>}
        <div className="subtask-draft">
          <input
            className="input"
            placeholder="Add a subtask"
            value={subtaskDraft}
            onChange={(event) => setSubtaskDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSubtask()
              }
            }}
          />
          <button type="button" className="btn btn-outline" onClick={addSubtask}>Add</button>
        </div>
      </section>

      {errorMessage ? <p className="message-error">{errorMessage}</p> : null}
      <button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 54 }} disabled={isPublishing || !title.trim() || selectedWorkers.length === 0}>
        {isPublishing ? <Spinner /> : selectedWorkers.length > 1 ? `Publish to ${selectedWorkers.length} workers` : 'Publish work'}
      </button>
    </form>
  )
}
