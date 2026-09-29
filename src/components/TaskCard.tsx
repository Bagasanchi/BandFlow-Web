import { useNavigate } from 'react-router'
import type { WorkItem } from '../api'
import { ProgressBar, StatusChip } from './ui'
import { priorityColor } from '../format'

export default function TaskCard({ task }: { task: WorkItem }) {
  const navigate = useNavigate()
  return (
    <button type="button" className="task-card" onClick={() => navigate(`/tasks/${task.id}`)}>
      <div className="top">
        <span className="title">{task.title}</span>
        <StatusChip status={task.status} />
      </div>
      <span className="meta">
        <span style={{ color: priorityColor(task.priority) }}>●</span> {task.priority} · Due {task.due}
      </span>
      <ProgressBar value={task.progress} />
    </button>
  )
}
