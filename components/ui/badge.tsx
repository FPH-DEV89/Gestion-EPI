import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" | "success" }>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-brand text-white",
            secondary: "bg-gray-100 text-gray-900",
            destructive: "bg-red-100 text-red-700",
            outline: "text-gray-950 border border-gray-200",
            success: "bg-green-100 text-green-700",
        }
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    variants[variant],
                    className
                )}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge }
