import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = ComponentProps<typeof Input> & { label: string; error?: string }

// Label + input + error line, wired by react-hook-form's register()
export function FormField({ label, error, id, ...props }: Props) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={!!error} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
