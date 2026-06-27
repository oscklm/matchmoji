import { Switch } from '@base-ui-components/react/switch'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, label, description, disabled, className = '' }: Props) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 ${
        disabled ? 'cursor-not-allowed opacity-40' : ''
      } ${className}`}
    >
      <span>
        <span className="block text-lg font-black">{label}</span>
        {description && <span className="block text-sm font-medium text-neutral-500">{description}</span>}
      </span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="relative h-7 w-12 shrink-0 border-2 border-black bg-white transition-colors data-[checked]:border-[#1b8a4b] data-[checked]:bg-[#1f9d55]"
      >
        <Switch.Thumb className="absolute top-0.5 left-0.5 h-5 w-5 bg-black transition-transform data-[checked]:translate-x-5 data-[checked]:bg-white" />
      </Switch.Root>
    </label>
  )
}
