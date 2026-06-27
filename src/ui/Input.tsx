import { Input as BaseInput } from '@base-ui-components/react/input'
import { tv, type VariantProps } from 'tailwind-variants'

export const input = tv({
  base: 'w-full border-2 border-black bg-white font-bold text-black outline-none placeholder:text-neutral-300',
  variants: {
    size: {
      md: 'px-3 py-2.5 text-base',
      lg: 'px-3 py-4 text-3xl tracking-[0.3em]',
    },
    center: { true: 'text-center' },
  },
  defaultVariants: { size: 'md' },
})

export type InputProps = Omit<React.ComponentProps<typeof BaseInput>, 'className' | 'size'> &
  VariantProps<typeof input> & { className?: string }

export function Input({ size, center, className, ...props }: InputProps) {
  return <BaseInput className={input({ size, center, className })} {...props} />
}
