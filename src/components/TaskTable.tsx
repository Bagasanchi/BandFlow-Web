import { useNavigate } from 'react-router'
import type { WorkItem } from '../api'
import Avatar from './Avatar'
import { ProgressBar, StatusChip } from './ui'
import { formatDue, priorityColor } from '../format'

type TaskTableProps = {
  tasks: WorkItem[]
  showAssignee: boolean
  onDelete?: (task: WorkItem) => void
  emptyText: string
}

function stepSummary(task: WorkItem) {
  if (!task.subtasks.length) return 'No steps'
  const done = task.subtasks.filter((subtask) => subtask.status === 'done').length
  if (done === task.subtasks.length) return `All ${task.subtasks.length} steps finished`
  const active = task.subtasks.find((subtask) => subtask.status === 'active')
  return active ? `Step ${active.order_index} of ${task.subtasks.length} · ${active.description}` : `${done} of ${task.subtasks.length} steps finished`
}

// Task list used on the dashboard and the All tasks page: one row per task, click to open.
export default function TaskTable({ tasks, showAssignee, onDelete, emptyText }: TaskTableProps) {
  const navigate = useNavigate()
  if (!tasks.length) return <p className="empty table-empty">{emptyText}</p>
  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Task</th>
            {showAssignee ? <th>Assigned to</th> : null}
            <th>Priority</th>
            <th>Due</th>
            <th>Progress</th>
            <th>Status</th>
            {onDelete ? <th aria-label="Actions" /> : null}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="clickable-row" onClick={() => navigate(`/tasks/${task.id}`)}>
              <td className="task-cell">
                <a href={`/tasks/${task.id}`} onClick={(event) => { event.preventDefault(); navigate(`/tasks/${task.id}`) }}>{task.title}</a>
                <span>{stepSummary(task)}</span>
              </td>
              {showAssignee ? <td><span className="who"><Avatar name={task.assignedTo} size={28} />{task.assignedTo}</span></td> : null}
              <td><span className="nowrap"><span className="priority-dot" style={{ background: priorityColor(task.priority) }} /> {task.priority}</span></td>
              <td className="nowrap">{formatDue(task.due)}</td>
              <td className="progress-cell"><ProgressBar value={task.progress} color={task.status === 'Done' ? 'var(--done)' : undefined} /></td>
              <td><StatusChip status={task.status} /></td>
              {onDelete ? (
                <td>
                  <button type="button" className="icon-button" aria-label={`Delete ${task.title}`} onClick={(event) => { event.stopPropagation(); onDelete(task) }}>×</button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
