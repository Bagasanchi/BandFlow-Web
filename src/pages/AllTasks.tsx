import { useState } from 'react'
import { useSearchParams } from 'react-router'
import type { WorkStatus } from '../api'
import TaskTable from '../components/TaskTable'
import { useSession } from '../session'

type Filter = 'all' | 'active' | WorkStatus
const filters: Array<{ value: Filter; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' },
  { value: 'all', label: 'All' },
]

// Every task the signed-in person can see (all work for a boss, their own for a worker),
// searchable from the top bar.
export default function AllTasks() {
  const { profile, workItems } = useSession()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [filter, setFilter] = useState<Filter>(query ? 'all' : 'active')
  const isBoss = profile?.role === 'boss'

  const needle = query.trim().toLowerCase()
  const visible = workItems
    .filter((item) => filter === 'all' || (filter === 'active' ? item.status !== 'Done' : item.status === filter))
    .filter((item) => !needle || [item.title, item.assignedTo, ...item.subtasks.map((subtask) => subtask.description)].some((text) => text.toLowerCase().includes(needle)))

  return (
    <div className="page page-wide">
      <div className="greet">
        <h1>{isBoss ? 'All tasks' : 'My tasks'}</h1>
        <p>{visible.length} of {workItems.length} shown</p>
      </div>
      <section className="panel">
        <header className="panel-head">
          <div className="segmented segmented-small" role="group" aria-label="Filter tasks">
            {filters.map((option) => (
              <button key={option.value} type="button" className={filter === option.value ? 'selected' : ''} aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
          {query ? (
            <span className="search-pill">
              Matching “{query}”
              <button type="button" aria-label="Clear search" onClick={() => setParams({})}>×</button>
            </span>
          ) : null}
        </header>
        <TaskTable tasks={visible} showAssignee={isBoss} emptyText={query ? 'No tasks match your search.' : 'No tasks here yet.'} />
      </section>
    </div>
  )
}
