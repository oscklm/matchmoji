import { Button as BaseButton } from '@base-ui-components/react/button'
import { tv, type VariantProps } from 'tailwind-variants'

export const button = tv({
  base: 'inline-flex items-center justify-center font-black select-none active:translate-y-px disabled:pointer-events-none disabled:bg-neutral-200 disabled:text-neutral-400',
  variants: {
    variant: {
      primary: 'bg-[#1f9d55] text-white hover:bg-[#1b8a4b]',
      info: 'bg-[#2b6ce4] text-white hover:bg-[#205bc7]',
      dark: 'bg-black text-white hover:bg-neutral-800',
      outline: 'border-2 border-black bg-white text-black hover:bg-neutral-100',
      ghost: 'bg-transparent text-neutral-500 hover:text-black',
      danger: 'bg-[#e23b3b] text-white hover:bg-[#c93030]',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-5 py-4 text-lg',
      icon: 'p-2',
    },
    block: { true: 'w-full' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export type ButtonProps = Omit<React.ComponentProps<typeof BaseButton>, 'className'> &
  VariantProps<typeof button> & { className?: string; type?: 'button' | 'submit' | 'reset' }

export function Button({ variant, size, block, className, type = 'button', ...props }: ButtonProps) {
  return <BaseButton type={type} className={button({ variant, size, block, className })} {...props} />
}
