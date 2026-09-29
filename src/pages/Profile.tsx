import { useRef, useState, type FormEvent } from 'react'
import { updateProfile, type ApiProfile } from '../api'
import Avatar from '../components/Avatar'
import { PageHeader, Spinner } from '../components/ui'
import { errorText } from '../format'
import { useSession } from '../session'

type Draft = { fullName: string; email: string; phone: string; jobTitle: string; avatar: string | null }

const toDraft = (profile: ApiProfile): Draft => ({ fullName: profile.fullName, email: profile.email, phone: profile.phone, jobTitle: profile.jobTitle, avatar: profile.avatar })

// Shrinks the chosen photo to a 512px square JPEG so it stays well under the server's 1.5 MB limit.
function resizeToSquareJpeg(file: File, size = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const side = Math.min(image.width, image.height)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('This browser cannot process images.'))
        return
      }
      context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file is not an image this browser can open.'))
    }
    image.src = url
  })
}

export default function Profile() {
  const { profile, setProfile } = useSession()
  const [draft, setDraft] = useState<Draft | null>(() => profile && toDraft(profile))
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  if (!profile || !draft) return null

  const isDirty = JSON.stringify(toDraft(profile)) !== JSON.stringify(draft)

  const edit = (field: keyof Draft, value: string | null) => {
    setSuccessMessage('')
    setDraft((current) => current && { ...current, [field]: value })
  }

  const choosePhoto = async (file: File | undefined) => {
    if (!file) return
    setErrorMessage('')
    try {
      edit('avatar', await resizeToSquareJpeg(file))
    } catch (error) {
      setErrorMessage(errorText(error, 'That photo could not be read.'))
    }
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      const saved = await updateProfile(draft)
      setProfile(saved)
      setDraft(toDraft(saved))
      setSuccessMessage('Profile saved.')
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to save your profile.'))
    } finally {
      setIsSaving(false)
    }
  }

  const fields: Array<{ key: 'fullName' | 'email' | 'phone' | 'jobTitle'; label: string; placeholder: string; type: string; autoComplete: string }> = [
    { key: 'fullName', label: 'Full name', placeholder: 'Your name', type: 'text', autoComplete: 'name' },
    { key: 'email', label: 'Email', placeholder: 'name@example.com', type: 'email', autoComplete: 'email' },
    { key: 'phone', label: 'Phone number', placeholder: '+976 9911 2233', type: 'tel', autoComplete: 'tel' },
    { key: 'jobTitle', label: 'Job title', placeholder: profile.role === 'boss' ? 'e.g. Site manager' : 'e.g. Electrician', type: 'text', autoComplete: 'organization-title' },
  ]

  return (
    <form className="page page-narrow" onSubmit={(event) => void save(event)}>
      <PageHeader title="Profile" subtitle="Your photo and contact details" />

      <section className="card" style={{ background: 'var(--accent-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '26px 18px' }}>
        <button type="button" onClick={() => fileInput.current?.click()} style={{ position: 'relative', background: 'none', border: 'none', padding: 0 }} aria-label="Change profile picture">
          <Avatar name={draft.fullName || profile.fullName} src={draft.avatar} size={112} />
          <span style={{ position: 'absolute', right: -2, bottom: -2, width: 36, height: 36, borderRadius: 18, border: '3px solid var(--bg)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📷</span>
        </button>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(event) => { void choosePhoto(event.target.files?.[0]); event.target.value = '' }} />
        <h2 style={{ fontSize: 22, fontWeight: 900, marginTop: 14 }}>{draft.fullName || 'Your name'}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span className="chip chip-accent">{profile.role === 'boss' ? 'Boss' : 'Worker'}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Member since {profile.createdAt.slice(0, 10)}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" className="btn btn-outline btn-small" style={{ borderColor: 'var(--accent)', background: 'var(--surface)' }} onClick={() => fileInput.current?.click()}>Upload photo</button>
          {draft.avatar ? <button type="button" className="btn btn-danger btn-small" style={{ background: 'var(--surface)' }} onClick={() => edit('avatar', null)}>Remove</button> : null}
        </div>
      </section>

      <section className="card form">
        <h2 className="card-title">Personal information</h2>
        {fields.map((field) => (
          <div key={field.key} className="field">
            <label htmlFor={field.key}>{field.label}</label>
            <input id={field.key} className="input" type={field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} value={draft[field.key]} onChange={(event) => edit(field.key, event.target.value)} />
          </div>
        ))}
      </section>

      {errorMessage ? <p className="message-error">{errorMessage}</p> : null}
      {successMessage ? <p className="message-success">{successMessage}</p> : null}
      <button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 52 }} disabled={!isDirty || isSaving}>
        {isSaving ? <Spinner /> : 'Save changes'}
      </button>
      {isDirty && !isSaving ? (
        <button type="button" className="link-button" style={{ alignSelf: 'center', color: 'var(--body)' }} onClick={() => { setDraft(toDraft(profile)); setErrorMessage('') }}>
          Discard changes
        </button>
      ) : null}
    </form>
  )
}
