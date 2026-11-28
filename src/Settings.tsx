import { useEffect, useState } from 'react'
import { SKINS, type Skin } from './skins'

type SettingsProps = {
  skin: Skin
  onSave: (skin: Skin) => void
}

export function Settings({ skin, onSave }: SettingsProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(skin)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open])

  return (
    <>
      <button
        type="button"
        className="settings-button"
        onClick={() => {
          setDraft(skin)
          setOpen(true)
        }}
        aria-label="Open settings"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={skin.settingsIcon} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.64 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.64a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.36 9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="drawer-scrim"
            onClick={() => setOpen(false)}
            aria-label="Close settings"
          />
          <aside className="drawer" role="dialog" aria-label="Settings">
            <div className="drawer__header">
              <h2>Settings</h2>
              <button
                type="button"
                className="drawer__close"
                onClick={() => setOpen(false)}
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <h3 className="drawer__section-title">Skins</h3>
            <div className="skin-list">
              {SKINS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`skin-card${draft.id === option.id ? ' is-selected' : ''}`}
                  onClick={() => setDraft(option)}
                  aria-pressed={draft.id === option.id}
                >
                  <span
                    className="skin-card__preview"
                    style={{ background: option.scrollerBackground }}
                  >
                    <span style={{ color: option.scrollerDigits }}>10</span>
                    <span
                      className="skin-card__timer"
                      style={{ background: option.timerBackground, color: option.timerDigits }}
                    >
                      01:00
                    </span>
                  </span>
                  <span className="skin-card__name">{option.name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="drawer__save"
              onClick={() => {
                onSave(draft)
                setOpen(false)
              }}
            >
              Save
            </button>
          </aside>
        </>
      )}
    </>
  )
}
