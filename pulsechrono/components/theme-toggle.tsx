"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-full bg-transparent border border-white/10 hover:bg-white/10"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: theme === "dark" ? 0 : 180 }}
          transition={{ duration: 0.5 }}
          className="relative w-5 h-5"
        >
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: theme === "dark" ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Moon className="h-5 w-5 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: theme === "dark" ? 0 : 1 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            className="absolute inset-0"
          >
            <Sun className="h-5 w-5 text-white" />
          </motion.div>
        </motion.div>
      </Button>
    </motion.div>
  )
}
