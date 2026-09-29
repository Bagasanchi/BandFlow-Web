import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import type { WorkStatus } from '../api'
import { statusClass } from '../format'

export function StatusChip({ status }: { status: WorkStatus }) {
  return <span className={`chip ${statusClass(status)}`}>{status}</span>
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress-row">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
      </div>
      <span className="value">{value}%</span>
    </div>
  )
}

export function Spinner() {
  return <div className="loader" role="status" aria-label="Loading" />
}

type PageHeaderProps = {
  kicker?: string
  title: string
  subtitle?: string
  back?: boolean
  aside?: ReactNode
}

export function PageHeader({ kicker, title, subtitle, back = true, aside }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="page-header">
      {back ? <button type="button" className="back-button" onClick={() => navigate(-1)}>Back</button> : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {aside}
    </header>
  )
}
