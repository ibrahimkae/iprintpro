import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: SliderPrimitive.Root.Props & { onValueChange?: (value: number[]) => void }) {
  const currentValues = Array.isArray(value) 
    ? value 
    : Array.isArray(defaultValue) 
      ? defaultValue 
      : [value ?? defaultValue ?? min];

  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      onValueChange={onValueChange}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full grow items-center h-5">
        <SliderPrimitive.Track
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200"
        >
          <SliderPrimitive.Indicator
            className="absolute h-full bg-teal-500"
          />
        </SliderPrimitive.Track>
        {currentValues.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-5 w-5 rounded-full border-2 border-teal-500 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
