import { useEffect, useState } from 'react'
import { getWorkers, resetWorkerPassword, updateWorkerStatus, type ApiWorker, type WorkerStatus } from '../api'
import Avatar from '../components/Avatar'
import { PageHeader, Spinner } from '../components/ui'
import { errorText } from '../format'

const statuses: WorkerStatus[] = ['active', 'away', 'offline']
const statusColor: Record<WorkerStatus, string> = { active: 'var(--done)', away: 'var(--review)', offline: 'var(--muted)' }

export default function Workers() {
  const [workers, setWorkers] = useState<ApiWorker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [resettingId, setResettingId] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [resetMessage, setResetMessage] = useState<{ workerId: string; text: string; isError: boolean } | null>(null)

  useEffect(() => {
    getWorkers()
      .then(setWorkers)
      .catch((error) => setErrorMessage(errorText(error, 'Unable to load workers.')))
      .finally(() => setIsLoading(false))
  }, [])

  const setStatus = async (workerId: string, status: WorkerStatus) => {
    setUpdatingId(workerId)
    setErrorMessage('')
    try {
      await updateWorkerStatus(workerId, status)
      setWorkers((current) => current.map((worker) => worker.id === workerId ? { ...worker, status } : worker))
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to update worker status.'))
    } finally {
      setUpdatingId('')
    }
  }

  const openReset = (workerId: string) => {
    setResettingId((current) => current === workerId ? '' : workerId)
    setTemporaryPassword('')
    setResetMessage(null)
  }

  const saveTemporaryPassword = async (worker: ApiWorker) => {
    if (temporaryPassword.length < 6) {
      setResetMessage({ workerId: worker.id, text: 'Use at least 6 characters.', isError: true })
      return
    }
    setIsSavingPassword(true)
    setResetMessage(null)
    try {
      await resetWorkerPassword(worker.id, temporaryPassword)
      setWorkers((current) => current.map((item) => item.id === worker.id ? { ...item, password_reset_requested_at: null } : item))
      setResettingId('')
      setResetMessage({ workerId: worker.id, text: `Temporary password set. Share it with ${worker.name.split(' ')[0]}; they can change it in Settings.`, isError: false })
    } catch (error) {
      setResetMessage({ workerId: worker.id, text: errorText(error, 'Unable to reset the password.'), isError: true })
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="page">
      <PageHeader title="Workers" subtitle="View worker accounts and availability" />
      {isLoading ? <Spinner /> : null}
      {errorMessage ? <p className="message-error">{errorMessage}</p> : null}
      {!isLoading && !errorMessage && workers.length === 0 ? <p className="empty">No worker accounts yet.</p> : null}

      <div className="grid-2">
        {workers.map((worker) => {
          const status = worker.status ?? 'active'
          return (
            <section key={worker.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={worker.name} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ color: 'var(--title)', fontSize: 16 }}>{worker.name}</strong>
                  <div style={{ fontSize: 12, marginTop: 3 }}>{worker.email}</div>
                  <div style={{ fontSize: 12, marginTop: 3 }}>Joined {worker.created_at?.slice(0, 10) ?? 'unknown'}</div>
                </div>
                <span style={{ color: statusColor[status], fontSize: 12, fontWeight: 900, textTransform: 'capitalize' }}>{status}</span>
              </div>
              {worker.password_reset_requested_at ? (
                <span className="chip status-review" style={{ marginTop: 12, border: '1px solid var(--review)' }}>🔑&nbsp; Password reset requested {worker.password_reset_requested_at.slice(0, 16)}</span>
              ) : null}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {statuses.map((option) => {
                  const selected = option === status
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={updatingId === worker.id}
                      onClick={() => void setStatus(worker.id, option)}
                      className="btn btn-small"
                      style={{
                        flex: 1,
                        textTransform: 'capitalize',
                        border: `1px solid ${selected ? statusColor[option] : 'var(--border)'}`,
                        background: selected ? `color-mix(in srgb, ${statusColor[option]} 14%, transparent)` : 'transparent',
                        color: selected ? statusColor[option] : 'var(--body)',
                      }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              <button type="button" className="back-button" style={{ marginTop: 12, minHeight: 34 }} onClick={() => openReset(worker.id)}>
                {resettingId === worker.id ? 'Cancel' : 'Reset password'}
              </button>
              {resettingId === worker.id ? (
                <form
                  style={{ display: 'flex', gap: 8, marginTop: 10 }}
                  onSubmit={(event) => {
                    event.preventDefault()
                    void saveTemporaryPassword(worker)
                  }}
                >
                  <input className="input" style={{ minHeight: 42 }} placeholder="Temporary password" autoComplete="off" value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} autoFocus />
                  <button type="submit" className="btn btn-primary" style={{ minHeight: 42 }} disabled={isSavingPassword}>{isSavingPassword ? <Spinner /> : 'Set'}</button>
                </form>
              ) : null}
              {resetMessage?.workerId === worker.id ? <p className={resetMessage.isError ? 'message-error' : 'message-success'} style={{ marginTop: 8 }}>{resetMessage.text}</p> : null}
            </section>
          )
        })}
      </div>
    </div>
  )
}
