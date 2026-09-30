import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { setSubtaskDone, updateWorkStatus, type SubtaskDetail, type WorkStatus } from '../api'
import Avatar from '../components/Avatar'
import { PageHeader, ProgressBar, Spinner, StatusChip } from '../components/ui'
import { errorText, priorityColor } from '../format'
import { useSession } from '../session'

const eisenhowerLabels: Record<string, string> = { do_first: 'Do first', schedule: 'Schedule', delegate: 'Delegate', eliminate: 'Eliminate' }

export default function TaskDetail() {
  const { id } = useParams()
  const { workItems, refreshWork } = useSession()
  const navigate = useNavigate()
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [togglingId, setTogglingId] = useState('')
  const task = workItems.find((item) => item.id === id)

  if (!task) {
    return (
      <div className="page page-narrow">
        <PageHeader title="Task not found" subtitle="It may have been deleted." />
      </div>
    )
  }

  const toggleSubtask = async (subtask: SubtaskDetail) => {
    if (togglingId) return
    setTogglingId(subtask.id)
    setErrorMessage('')
    try {
      await setSubtaskDone(task.id, subtask.id, subtask.status !== 'done')
      await refreshWork()
    } catch (error) {
      setErrorMessage(errorText(error, 'Could not update the subtask.'))
    } finally {
      setTogglingId('')
    }
  }

  const submitStatus = async (status: WorkStatus) => {
    setIsUpdating(true)
    setErrorMessage('')
    try {
      await updateWorkStatus(task.id, status)
      await refreshWork()
      navigate(-1)
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to update the task.'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="page page-narrow">
      <PageHeader kicker="TASK DETAILS" title={task.title} aside={<StatusChip status={task.status} />} />

      <section className="hero" style={{ gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 13, fontWeight: 700 }}>
          <span><span className="priority-dot" style={{ background: priorityColor(task.priority), marginRight: 6 }} />{task.priority} priority</span>
          <span>Due {task.due}</span>
          {task.eisenhowerCategory ? <span>{eisenhowerLabels[task.eisenhowerCategory] ?? task.eisenhowerCategory}</span> : null}
        </div>
        <ProgressBar value={task.progress} />
      </section>

      <section className="card">
        <p className="kicker" style={{ color: 'var(--body)' }}>ASSIGNED TO</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={task.assignedTo} size={40} />
          <strong style={{ color: 'var(--title)', fontSize: 16 }}>{task.assignedTo}</strong>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title" style={{ letterSpacing: 0.8, fontSize: 14, marginBottom: 10 }}>SUBTASKS</h2>
        {task.subtasks.length === 0 ? <p className="empty" style={{ padding: 0 }}>No subtasks were added.</p> : null}
        {task.subtasks.map((subtask) => (
          <button
            key={subtask.id}
            type="button"
            role="checkbox"
            aria-checked={subtask.status === 'done'}
            disabled={Boolean(togglingId)}
            onClick={() => void toggleSubtask(subtask)}
            className="subtask-toggle"
          >
            <span className={`checkbox ${subtask.status}`}>{togglingId === subtask.id ? '…' : subtask.status === 'done' ? '✓' : ''}</span>
            <span style={{ flex: 1, textDecoration: subtask.status === 'done' ? 'line-through' : 'none', color: subtask.status === 'active' ? 'var(--title)' : undefined, fontWeight: subtask.status === 'active' ? 800 : 500 }}>
              {subtask.description}
            </span>
            {subtask.status === 'active' ? <span className="chip status-progress">On the band</span> : null}
          </button>
        ))}
        <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--muted)' }}>Click a step to tick it, or finish it on the wristband. The next step is sent to the watch automatically.</p>
      </section>

      {errorMessage ? <p className="message-error">{errorMessage}</p> : null}
      {task.status !== 'Done' ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-primary" style={{ flex: 1, minHeight: 50 }} disabled={isUpdating || task.status === 'Review'} onClick={() => void submitStatus('Review')}>
            {task.status === 'Review' ? 'Submitted for review' : 'Submit for review'}
          </button>
          <button type="button" className="btn btn-success" style={{ flex: 1, minHeight: 50 }} disabled={isUpdating} onClick={() => void submitStatus('Done')}>
            {isUpdating ? <Spinner /> : 'Mark as done'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
