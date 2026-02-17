"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors">
                <div className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md" />
            </button>
        )
    }

    const isDark = theme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative w-14 h-7 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-indigo-600 dark:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            aria-label="Toggle theme"
        >
            {/* Slider */}
            <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${isDark ? "left-[calc(100%-1.625rem)]" : "left-0.5"
                    }`}
            >
                {isDark ? (
                    <Moon className="w-4 h-4 text-indigo-600" />
                ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                )}
            </div>
        </button>
    )
}
