import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { setSubtaskDone, updateWorkStatus, type SubtaskDetail, type WorkStatus } from '../api'
import Avatar from '../components/Avatar'
import { ProgressBar, Spinner, StatusChip } from '../components/ui'
import { errorText, formatDue, formatTime, parseServerTime, priorityColor } from '../format'
import { useSession } from '../session'

const eisenhowerLabels: Record<string, string> = { do_first: 'Do first', schedule: 'Schedule', delegate: 'Delegate', eliminate: 'Eliminate' }

type ActivityEntry = { at: Date; key: string; text: 'sent' | 'finished'; step: string }

// History built from the steps' own timestamps: when each was sent to the band and when it was finished.
function activityFor(subtasks: SubtaskDetail[]) {
  const entries: ActivityEntry[] = []
  for (const subtask of subtasks) {
    const started = parseServerTime(subtask.started_at)
    const completed = parseServerTime(subtask.completed_at)
    if (started) entries.push({ at: started, key: `${subtask.id}-sent`, text: 'sent', step: subtask.description })
    if (completed) entries.push({ at: completed, key: `${subtask.id}-done`, text: 'finished', step: subtask.description })
  }
  return entries.sort((a, b) => b.at.getTime() - a.at.getTime())
}

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
      <div className="page page-wide">
        <div className="greet"><h1>Task not found</h1><p>It may have been deleted. <Link to="/tasks">See all tasks</Link></p></div>
      </div>
    )
  }

  const doneCount = task.subtasks.filter((subtask) => subtask.status === 'done').length
  const activity = activityFor(task.subtasks)

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
    <div className="page page-wide">
      <p className="crumbs"><Link to="/tasks">Tasks</Link> / <span>{task.title}</span></p>
      <div className="task-head">
        <div className="task-head-copy">
          <h1>{task.title}</h1>
          <div className="task-tags">
            <StatusChip status={task.status} />
            <span><span className="priority-dot" style={{ background: priorityColor(task.priority) }} /> {task.priority} priority</span>
            <span>Due {formatDue(task.due)}</span>
          </div>
        </div>
        {task.status !== 'Done' ? (
          <div className="task-actions">
            <button type="button" className="btn btn-outline" disabled={isUpdating || task.status === 'Review'} onClick={() => void submitStatus('Review')}>
              {task.status === 'Review' ? 'Submitted for review' : 'Submit for review'}
            </button>
            <button type="button" className="btn btn-success" disabled={isUpdating} onClick={() => void submitStatus('Done')}>
              {isUpdating ? <Spinner /> : 'Mark as done'}
            </button>
          </div>
        ) : null}
      </div>
      {errorMessage ? <p className="message-error">{errorMessage}</p> : null}

      <div className="dash-cols">
        <section className="panel">
          <div className="task-progress">
            <div className="task-progress-top"><span>Progress</span><span>{task.subtasks.length ? `${doneCount} of ${task.subtasks.length} steps` : ''}</span></div>
            <ProgressBar value={task.progress} color={task.status === 'Done' ? 'var(--done)' : undefined} />
          </div>
          {task.subtasks.length === 0 ? <p className="empty table-empty">This task has no steps. Use Mark as done when it is finished.</p> : null}
          <div className="checklist">
            {task.subtasks.map((subtask) => (
              <button
                key={subtask.id}
                type="button"
                role="checkbox"
                aria-checked={subtask.status === 'done'}
                disabled={Boolean(togglingId)}
                onClick={() => void toggleSubtask(subtask)}
                className={`subtask-toggle ${subtask.status}`}
              >
                <span className={`checkbox ${subtask.status}`}>{togglingId === subtask.id ? '…' : subtask.status === 'done' ? '✓' : ''}</span>
                <span className="subtask-label">{subtask.description}</span>
                {subtask.status === 'active' ? <span className="chip status-progress">On the band</span> : null}
              </button>
            ))}
          </div>
          {task.subtasks.length ? <p className="panel-foot">Click a step to tick it, or finish it on the wristband. The next step is sent to the watch automatically.</p> : null}
        </section>

        <div className="side-stack">
          <section className="panel">
            <header className="panel-head"><h2>Details</h2></header>
            <dl className="details">
              <div><dt>Assigned to</dt><dd><span className="who"><Avatar name={task.assignedTo} size={24} />{task.assignedTo}</span></dd></div>
              <div><dt>Priority</dt><dd>{task.priority}</dd></div>
              <div><dt>Due</dt><dd>{task.due === 'Unscheduled' ? 'Unscheduled' : formatDue(task.due)}</dd></div>
              {task.eisenhowerCategory ? <div><dt>Eisenhower</dt><dd>{eisenhowerLabels[task.eisenhowerCategory] ?? task.eisenhowerCategory}</dd></div> : null}
              <div><dt>Steps</dt><dd>{task.subtasks.length ? `${doneCount} / ${task.subtasks.length} done` : 'None'}</dd></div>
            </dl>
          </section>
          <section className="panel">
            <header className="panel-head"><h2>Activity</h2></header>
            {activity.length === 0 ? <p className="empty table-empty">Nothing has happened on the band yet.</p> : (
              <ol className="timeline">
                {activity.map((entry) => (
                  <li key={entry.key}>
                    <span className={`timeline-dot ${entry.text}`} aria-hidden="true" />
                    <div>
                      {entry.text === 'sent' ? <>Sent <strong>{entry.step}</strong> to the band</> : <><strong>{entry.step}</strong> finished</>}
                      <time dateTime={entry.at.toISOString()}>{formatTime(entry.at)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
