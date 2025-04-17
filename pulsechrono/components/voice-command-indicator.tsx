"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceCommandIndicatorProps {
  active: boolean
  command: string
  onClick: () => void
}

export default function VoiceCommandIndicator({ active, command, onClick }: VoiceCommandIndicatorProps) {
  return (
    <div className="relative">
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={onClick}
          className={`rounded-full ${
            active
              ? "bg-fuchsia-500/20 border-fuchsia-500/50 hover:bg-fuchsia-500/30"
              : "bg-transparent border border-white/10 hover:bg-white/10"
          }`}
        >
          {active ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <Mic className="h-5 w-5 text-fuchsia-400" />
            </motion.div>
          ) : (
            <MicOff className="h-5 w-5 text-white" />
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {active && command && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-full mt-2 right-0 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm whitespace-nowrap z-50"
          >
            {command === "Listening..." ? (
              <div className="flex items-center">
                <span>{command}</span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="ml-1"
                >
                  ...
                </motion.span>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-fuchsia-400 mr-1">Command:</span>
                <span>{command}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
