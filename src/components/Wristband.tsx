// The wristband's screen, drawn like the firmware's: 320x170 display, #101820 ground, "CURRENT TASK" heading.
export default function Wristband({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={`band${compact ? ' band-compact' : ''}`} aria-label={`Wristband showing: ${text}`}>
      <div className="band-strap" />
      <div className="band-body">
        <div className="band-face">
          <small>CURRENT TASK</small>
          <strong>{text}</strong>
        </div>
      </div>
      <div className="band-strap bottom" />
    </div>
  )
}
