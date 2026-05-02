type OptoLogoProps = {
  className?: string
}

export function OptoLogo({ className }: OptoLogoProps) {
  return (
    <span
      className={`font-brand text-[1.375rem] uppercase tracking-[0.05em] bg-gradient-to-r from-[#0071e3] to-[#38bdf8] bg-clip-text text-transparent select-none ${className ?? ''}`}
      style={{ fontWeight: 600 }}
    >
      Opto
    </span>
  )
}
