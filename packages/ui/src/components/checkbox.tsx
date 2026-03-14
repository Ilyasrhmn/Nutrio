import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-sm border border-slate-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-indigo-600 transition-all",
        className
      )}
      {...props}
    />
  )
}

export { Checkbox }
