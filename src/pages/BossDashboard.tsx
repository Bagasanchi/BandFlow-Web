import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteWork, getWorkers, type ApiWorker, type WorkItem, type WorkStatus } from '../api'
import Avatar from '../components/Avatar'
import TaskTable from '../components/TaskTable'
import Wristband from '../components/Wristband'
import { errorText, formatTime, parseDue, parseServerTime } from '../format'
import { useSession } from '../session'

type Filter = 'all' | WorkStatus
const filters: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'In Progress', label: 'In progress' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' },
]
const statusColor: Record<string, string> = { active: 'var(--done)', away: 'var(--review)', offline: 'var(--muted)' }

function greeting(now: Date) {
  const hour = now.getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

// The step most recently sent to a worker's wristband: their newest active step.
// Without a worker, the newest active step of anyone (the one the watch received last).
function stepOnWatch(workItems: WorkItem[], workerName?: string) {
  let latest: { task: WorkItem; description: string; order: number; since: Date | null } | null = null
  for (const task of workItems) {
    if (workerName && task.assignedTo !== workerName) continue
    for (const subtask of task.subtasks) {
      if (subtask.status !== 'active') continue
      const since = parseServerTime(subtask.started_at)
      if (!latest || (since && (!latest.since || since > latest.since))) latest = { task, description: subtask.description, order: subtask.order_index, since }
    }
  }
  return latest
}

export default function BossDashboard() {
  const { profile, workItems, refreshWork } = useSession()
  const [filter, setFilter] = useState<Filter>('all')
  const [workers, setWorkers] = useState<ApiWorker[]>([])
  const [confirming, setConfirming] = useState<WorkItem | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [now] = useState(() => new Date())
  const [watchWorker, setWatchWorker] = useState('')

  useEffect(() => {
    getWorkers().then(setWorkers).catch(() => setWorkers([]))
  }, [])

  if (!profile) return null

  const active = workItems.filter((item) => item.status !== 'Done')
  const review = workItems.filter((item) => item.status === 'Review')
  const done = workItems.filter((item) => item.status === 'Done')
  const weekAhead = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
  const dueSoon = active.filter((item) => { const due = parseDue(item.due); return due && due <= weekAhead }).length
  const averageProgress = active.length ? Math.round(active.reduce((total, item) => total + item.progress, 0) / active.length) : 0
  // Until the boss picks someone, follow the worker whose watch got a step most recently.
  const selectedWorker = watchWorker || stepOnWatch(workItems)?.task.assignedTo || workers[0]?.name || ''
  const onWatch = selectedWorker ? stepOnWatch(workItems, selectedWorker) : null
  const visible = filter === 'all' ? workItems : workItems.filter((item) => item.status === filter)

  const kpis = [
    { label: 'Active tasks', value: active.length, note: dueSoon ? `${dueSoon} due within a week` : 'Nothing due this week' },
    { label: 'Waiting for review', value: review.length, note: review[0]?.title ?? 'Nothing to review' },
    { label: 'Finished', value: done.length, note: `of ${workItems.length} ${workItems.length === 1 ? 'task' : 'tasks'} in total` },
    { label: 'Average progress', value: `${averageProgress}%`, note: 'Across active work' },
  ]

  const remove = async (task: WorkItem) => {
    setErrorMessage('')
    try {
      await deleteWork(task.id)
      setConfirming(null)
      await refreshWork()
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to delete the task.'))
    }
  }

  return (
    <div className="page page-wide">
      <div className="greet">
        <h1>{greeting(now)}, {profile.fullName.split(' ')[0]}</h1>
        <p>{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="kpis">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi">
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.note}</small>
          </div>
        ))}
      </div>

      {confirming ? (
        <div className="confirm-bar" role="alertdialog" aria-label="Confirm delete">
          <span>Delete <strong>{confirming.title}</strong>? This can't be undone.</span>
          <button type="button" className="btn btn-danger btn-small" onClick={() => void remove(confirming)}>Delete</button>
          <button type="button" className="btn btn-outline btn-small" onClick={() => setConfirming(null)}>Cancel</button>
        </div>
      ) : null}
      {errorMessage ? <p className="message-error">{errorMessage}</p> : null}

      <div className="dash-cols dash-table">
        <section className="panel">
          <header className="panel-head">
            <h2>Tasks</h2>
            <div className="segmented segmented-small" role="group" aria-label="Filter tasks">
              {filters.map((option) => (
                <button key={option.value} type="button" className={filter === option.value ? 'selected' : ''} aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </header>
          <TaskTable
            tasks={visible}
            showAssignee
            onDelete={(task) => setConfirming(task)}
            emptyText={workItems.length ? 'No tasks with this status.' : 'No work yet. Use New work to create the first task.'}
          />
        </section>

        <div className="side-stack">
          <section className="panel">
            <header className="panel-head">
              <h2>Worker's wristband</h2>
              {workers.length ? (
                <select id="watch-worker" className="select select-small" aria-label="Show the wristband of" value={selectedWorker} onChange={(event) => setWatchWorker(event.target.value)}>
                  {workers.map((worker) => <option key={worker.id} value={worker.name}>{worker.name}</option>)}
                </select>
              ) : null}
            </header>
            <div className="watch-panel">
              {workers.length === 0 ? (
                <p className="empty">No worker accounts yet.</p>
              ) : (
                <>
                  {/* "Waiting for a task..." is what the firmware shows before it receives a step. */}
                  <Wristband text={onWatch ? onWatch.description : 'Waiting for a task...'} compact />
                  <div className="watch-meta">
                    {onWatch ? (
                      <>
                        <Link to={`/tasks/${onWatch.task.id}`}>{onWatch.task.title}</Link>
                        <span>Step {onWatch.order} of {onWatch.task.subtasks.length}{onWatch.since ? ` · since ${formatTime(onWatch.since)}` : ''}</span>
                      </>
                    ) : (
                      <span>{selectedWorker} has no step waiting on the wristband.</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="panel">
            <header className="panel-head"><h2>Team</h2><Link to="/workers" className="panel-link">Manage</Link></header>
            {workers.length === 0 ? <p className="empty table-empty">No worker accounts yet.</p> : null}
            <ul className="team-list">
              {workers.map((worker) => {
                const count = active.filter((item) => item.assignedTo === worker.name).length
                const status = worker.status ?? 'active'
                return (
                  <li key={worker.id}>
                    <Avatar name={worker.name} size={32} />
                    <span className="team-copy">
                      <strong>{worker.name}</strong>
                      <small>{worker.password_reset_requested_at ? 'Asked for a password reset' : count === 1 ? '1 active task' : `${count} active tasks`}</small>
                    </span>
                    <span className="team-state" style={{ color: statusColor[status] }}>{status}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
