type SliderProps = {
  id: string
  label: string
  min: number
  max: number
  step: number
  value: number
  display: string
  onChange: (value: number) => void
}

export function Slider({ id, label, min, max, step, value, display, onChange }: SliderProps) {
  return (
    <div className="slider">
      <div className="slider-top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{display}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
