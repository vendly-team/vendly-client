type OptoLogoProps = {
  className?: string
  mini?: boolean
}

export function OptoLogo({ className, mini }: OptoLogoProps) {
  if (mini) {
    return (
      <img
        src="/opto-mini.svg"
        alt="Opto"
        className={`h-12 w-12 select-none ${className ?? ''}`}
        draggable={false}
      />
    )
  }

  return (
    <span className={`inline-flex items-center select-none ${className ?? ''}`}>
      {/* Mobile: mini icon */}
      <img
        src="/opto-mini.svg"
        alt="Opto"
        className="block md:hidden h-12 w-12"
        draggable={false}
      />
      {/* Desktop: full logo */}
      <img
        src="/opto.svg"
        alt="Opto"
        className="hidden md:block h-12 w-auto"
        draggable={false}
      />
    </span>
  )
}
