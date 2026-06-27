export function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mb-2 text-xs font-black uppercase tracking-widest text-neutral-400 ${className}`}>{children}</p>
  )
}
