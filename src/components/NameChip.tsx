import { useState } from 'react'

interface Props {
  name: string
  onChange: (name: string) => void
}

export function NameChip({ name, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  const commit = () => {
    onChange(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          maxLength={24}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="w-44 rounded-full bg-white/10 px-4 py-1.5 text-center font-bold text-white outline-none ring-2 ring-emerald-400"
        />
        <button
          type="button"
          onClick={commit}
          className="rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white"
        >
          OK
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(name)
        setEditing(true)
      }}
      className="group flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-bold text-white transition hover:bg-white/15"
    >
      <span>{name}</span>
      <span className="text-xs opacity-50 group-hover:opacity-90">✎</span>
    </button>
  )
}
