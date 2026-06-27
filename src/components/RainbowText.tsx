const RAINBOW = ['#e23b3b', '#e8730c', '#caa200', '#1f9d55', '#2b6ce4', '#7b3fe4']

export function RainbowText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {[...text].map((ch, i) => (
        <span key={i} style={{ color: RAINBOW[i % RAINBOW.length] }}>
          {ch}
        </span>
      ))}
    </span>
  )
}
