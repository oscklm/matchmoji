import { Pencil, Check, X } from 'lucide-react'

// Central icon map — swap the underlying library here without touching callers.
export const Icons = {
  Edit: Pencil,
  Confirm: Check,
  Close: X,
}

export type IconName = keyof typeof Icons
