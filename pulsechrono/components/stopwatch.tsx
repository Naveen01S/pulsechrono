"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, RotateCcw, Flag, BarChart2 } from "lucide-react"
import { useTheme } from "next-themes"
import LapChart from "@/components/lap-chart"

type Lap = {
  id: number
  time: number
  formattedTime: string
  type: "normal" | "fastest" | "slowest"
}

export default function Stopwatch({
  setIsActive,
  voiceCommand,
}: {
  setIsActive: (active: boolean) => void
  voiceCommand: string
}) {
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const [lastLapTime, setLastLapTime] = useState(0)
  const [showChart, setShowChart] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  // Process voice commands
  useEffect(() => {
    if (voiceCommand.toLowerCase().includes("start") && !running) {
      handleStartStop()
    } else if (
      (voiceCommand.toLowerCase().includes("stop") || voiceCommand.toLowerCase().includes("pause")) &&
      running
    ) {
      handleStartStop()
    } else if (voiceCommand.toLowerCase().includes("lap") && running) {
      handleLap()
    } else if (voiceCommand.toLowerCase().includes("reset")) {
      handleReset()
    }
  }, [voiceCommand])

  useEffect(() => {
    // Create audio elements for button sounds
    audioRef.current = new Audio("/button-click.mp3")

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10)
      }, 10)
      setIsActive(true)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (time === 0) {
        setIsActive(false)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [running, setIsActive, time])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
  }

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((e) => console.log("Audio play failed:", e))
    }
  }

  const handleStartStop = () => {
    playSound()
    setRunning(!running)
    if (time === 0 && !running) {
      // Reset laps when starting from 0
      setLaps([])
      setLastLapTime(0)
      setShowChart(false)
    }
  }

  const handleReset = () => {
    playSound()
    setRunning(false)
    setTime(0)
    setLastLapTime(0)
    setIsActive(false)
    // Keep laps for review but hide chart
    setShowChart(false)
  }

  const handleLap = () => {
    if (!running) return

    playSound()
    const lapTime = time - lastLapTime
    setLastLapTime(time)

    // Calculate if this is fastest or slowest
    let type: "normal" | "fastest" | "slowest" = "normal"

    if (laps.length > 0) {
      const lapTimes = laps.map((lap) => lap.time)
      if (lapTime < Math.min(...lapTimes)) {
        type = "fastest"
      } else if (lapTime > Math.max(...lapTimes)) {
        type = "slowest"
      }
    }

    const newLap: Lap = {
      id: Date.now(),
      time: lapTime,
      formattedTime: formatTime(lapTime),
      type,
    }

    // Update previous laps if needed
    if (laps.length > 0) {
      const updatedLaps = laps.map((lap) => {
        if (lap.type === "fastest" && type === "fastest") {
          return { ...lap, type: "normal" }
        }
        if (lap.type === "slowest" && type === "slowest") {
          return { ...lap, type: "normal" }
        }
        return lap
      })
      setLaps([newLap, ...updatedLaps])
    } else {
      setLaps([newLap])
    }
  }

  const toggleChart = () => {
    playSound()
    setShowChart(!showChart)
  }

  const getTypeColor = (type: "normal" | "fastest" | "slowest") => {
    switch (type) {
      case "fastest":
        return isDarkMode ? "text-cyan-400" : "text-cyan-600"
      case "slowest":
        return isDarkMode ? "text-fuchsia-400" : "text-fuchsia-600"
      default:
        return isDarkMode ? "text-white" : "text-slate-800"
    }
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative w-64 h-64 mb-6 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Outer pulsating circle */}
        <motion.div
          className="absolute w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle, ${
              isDarkMode ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.1)"
            } 0%, transparent 70%)`,
          }}
          animate={{
            scale: running ? [1, 1.05, 1] : 1,
            opacity: running ? [0.7, 0.3, 0.7] : 0.5,
          }}
          transition={{
            duration: 2,
            repeat: running ? Number.POSITIVE_INFINITY : 0,
            repeatType: "reverse",
          }}
        />

        {/* Middle pulsating circle */}
        <motion.div
          className="absolute w-[85%] h-[85%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${
              isDarkMode ? "rgba(192, 132, 252, 0.15)" : "rgba(192, 132, 252, 0.1)"
            } 0%, transparent 70%)`,
          }}
          animate={{
            scale: running ? [1, 1.1, 1] : 1,
            opacity: running ? [0.6, 0.2, 0.6] : 0.4,
          }}
          transition={{
            duration: 2.5,
            delay: 0.2,
            repeat: running ? Number.POSITIVE_INFINITY : 0,
            repeatType: "reverse",
          }}
        />

        {/* Inner pulsating circle */}
        <motion.div
          className="absolute w-[70%] h-[70%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${
              isDarkMode ? "rgba(232, 121, 249, 0.15)" : "rgba(232, 121, 249, 0.1)"
            } 0%, transparent 70%)`,
          }}
          animate={{
            scale: running ? [1, 1.15, 1] : 1,
            opacity: running ? [0.5, 0.1, 0.5] : 0.3,
          }}
          transition={{
            duration: 3,
            delay: 0.4,
            repeat: running ? Number.POSITIVE_INFINITY : 0,
            repeatType: "reverse",
          }}
        />

        <svg className="w-full h-full" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#stopwatchGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: running ? [0, 0.5, 1] : 0,
              rotate: running ? 360 : 0,
            }}
            transition={{
              pathLength: { duration: 2, repeat: Number.POSITIVE_INFINITY },
              rotate: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            }}
          />
          <defs>
            <linearGradient id="stopwatchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`text-6xl font-mono font-bold tabular-nums ${isDarkMode ? "text-white" : "text-slate-800"}`}
            animate={{ scale: running ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 1, repeat: running ? Number.POSITIVE_INFINITY : 0 }}
          >
            {formatTime(time)}
          </motion.div>
          <div className={`text-xs ${isDarkMode ? "text-white/60" : "text-slate-500"} mt-2`}>
            {laps.length > 0 ? `Lap ${laps.length}` : "Ready"}
          </div>
        </div>
      </motion.div>

      <div className="flex gap-4 mb-6">
        <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
          <Button
            variant="outline"
            size="icon"
            className={`w-12 h-12 rounded-full ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200"
            }`}
            onClick={handleReset}
            disabled={time === 0}
          >
            <RotateCcw className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-slate-700"}`} />
          </Button>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          animate={{
            boxShadow: running
              ? ["0 0 0 rgba(139, 92, 246, 0)", "0 0 20px rgba(139, 92, 246, 0.5)", "0 0 0 rgba(139, 92, 246, 0)"]
              : "0 0 0 rgba(139, 92, 246, 0)",
          }}
          transition={{ duration: 2, repeat: running ? Number.POSITIVE_INFINITY : 0 }}
        >
          <Button
            size="icon"
            className={`w-16 h-16 rounded-full ${
              running
                ? "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-violet-500"
                : "bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-500 hover:via-purple-500 hover:to-cyan-500"
            }`}
            onClick={handleStartStop}
          >
            {running ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-1" />}
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
          <Button
            variant="outline"
            size="icon"
            className={`w-12 h-12 rounded-full ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200"
            }`}
            onClick={handleLap}
            disabled={!running}
          >
            <Flag className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-slate-700"}`} />
          </Button>
        </motion.div>
      </div>

      {laps.length > 0 && (
        <motion.div
          className="w-full"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className={`text-sm font-medium ${isDarkMode ? "text-white/70" : "text-slate-600"}`}>Lap History</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChart}
              className={isDarkMode ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-slate-900"}
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              {showChart ? "Hide Chart" : "Show Chart"}
            </Button>
          </div>

          <AnimatePresence>
            {showChart && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <LapChart laps={laps} isDarkMode={isDarkMode} />
              </motion.div>
            )}
          </AnimatePresence>

          <ScrollArea
            className={`h-[120px] w-full rounded-md border ${
              isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="p-4">
              {laps.map((lap, index) => (
                <motion.div
                  key={lap.id}
                  className={`flex justify-between py-2 border-b ${
                    isDarkMode ? "border-white/5" : "border-slate-200"
                  } last:border-0 ${getTypeColor(lap.type)}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <span className="font-medium">Lap {laps.length - index}</span>
                  <span className="font-mono">{lap.formattedTime}</span>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </div>
  )
}
