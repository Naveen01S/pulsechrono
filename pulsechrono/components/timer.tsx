"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, RotateCcw, Check, Clock } from "lucide-react"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Preset workout templates
const WORKOUT_PRESETS = {
  hiit: { name: "HIIT", minutes: 4, seconds: 0, description: "High Intensity Interval Training" },
  tabata: { name: "Tabata", minutes: 4, seconds: 0, description: "20s work, 10s rest x8" },
  pomodoro: { name: "Pomodoro", minutes: 25, seconds: 0, description: "Focus session" },
  shortBreak: { name: "Short Break", minutes: 5, seconds: 0, description: "Quick rest" },
}

export default function Timer({
  setIsActive,
  voiceCommand,
}: {
  setIsActive: (active: boolean) => void
  voiceCommand: string
}) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [initialTime, setInitialTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [inputMinutes, setInputMinutes] = useState("")
  const [inputSeconds, setInputSeconds] = useState("")
  const [selectedPreset, setSelectedPreset] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const completionAudioRef = useRef<HTMLAudioElement | null>(null)
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
    } else if (voiceCommand.toLowerCase().includes("reset")) {
      handleReset()
    } else if (voiceCommand.toLowerCase().includes("hiit")) {
      applyPreset("hiit")
    } else if (voiceCommand.toLowerCase().includes("tabata")) {
      applyPreset("tabata")
    } else if (voiceCommand.toLowerCase().includes("pomodoro")) {
      applyPreset("pomodoro")
    }
  }, [voiceCommand])

  useEffect(() => {
    // Create audio elements
    audioRef.current = new Audio("/button-click.mp3")
    completionAudioRef.current = new Audio("/timer-complete.mp3")

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (completionAudioRef.current) {
        completionAudioRef.current.pause()
        completionAudioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            setCompleted(true)
            // Play completion sound
            if (completionAudioRef.current) {
              completionAudioRef.current.play().catch((e) => console.log("Audio play failed:", e))
            }
            return 0
          }
          return prev - 1000
        })
      }, 1000)
      setIsActive(true)
    } else if (!running && intervalRef.current) {
      clearInterval(intervalRef.current)
      if (timeLeft === 0 && initialTime === 0) {
        setIsActive(false)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [running, timeLeft, initialTime, setIsActive])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((e) => console.log("Audio play failed:", e))
    }
  }

  const handleStartStop = () => {
    playSound()
    if (timeLeft === 0 && !running) {
      // Start a new timer
      const mins = Number.parseInt(inputMinutes || "0")
      const secs = Number.parseInt(inputSeconds || "0")
      const totalMs = (mins * 60 + secs) * 1000

      if (totalMs > 0) {
        setTimeLeft(totalMs)
        setInitialTime(totalMs)
        setRunning(true)
        setCompleted(false)
      }
    } else {
      // Toggle existing timer
      setRunning(!running)
    }
  }

  const handleReset = () => {
    playSound()
    setRunning(false)
    setTimeLeft(0)
    setInitialTime(0)
    setCompleted(false)
    setInputMinutes("")
    setInputSeconds("")
    setSelectedPreset("")
    setIsActive(false)
  }

  const setPresetTime = (minutes: number, seconds = 0) => {
    const ms = (minutes * 60 + seconds) * 1000
    setTimeLeft(ms)
    setInitialTime(ms)
    setInputMinutes(minutes.toString())
    setInputSeconds(seconds.toString())
    setCompleted(false)
  }

  const applyPreset = (presetKey: string) => {
    playSound()
    const preset = WORKOUT_PRESETS[presetKey as keyof typeof WORKOUT_PRESETS]
    if (preset) {
      setPresetTime(preset.minutes, preset.seconds)
      setSelectedPreset(presetKey)
    }
  }

  const progress = initialTime > 0 ? 1 - timeLeft / initialTime : 0

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
              isDarkMode ? "rgba(6, 182, 212, 0.15)" : "rgba(6, 182, 212, 0.1)"
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
              isDarkMode ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.1)"
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
              isDarkMode ? "rgba(6, 182, 212, 0.15)" : "rgba(6, 182, 212, 0.1)"
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
          <circle
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
            stroke={completed ? "#10b981" : "url(#timerGradient)"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="283"
            initial={{ strokeDashoffset: 283 }}
            animate={{
              strokeDashoffset: 283 - 283 * progress,
            }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {initialTime > 0 || completed ? (
            <motion.div
              className={`text-6xl font-mono font-bold tabular-nums ${isDarkMode ? "text-white" : "text-slate-800"}`}
              animate={{
                scale: completed ? [1, 1.2, 1] : running ? [1, 1.02, 1] : 1,
                color: completed ? "#10b981" : isDarkMode ? "#ffffff" : "#1e293b",
              }}
              transition={{
                scale: {
                  duration: completed ? 0.5 : 1,
                  repeat: completed ? 0 : running ? Number.POSITIVE_INFINITY : 0,
                },
              }}
            >
              {completed ? "00:00" : formatTime(timeLeft)}
            </motion.div>
          ) : (
            <div className="flex gap-1 items-center">
              <Input
                type="number"
                min="0"
                max="99"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                className={`w-16 h-12 text-center text-xl bg-transparent ${
                  isDarkMode ? "border-white/20 focus:border-white/40" : "border-slate-300 focus:border-slate-400"
                }`}
                placeholder="00"
              />
              <span className={`text-2xl ${isDarkMode ? "text-white" : "text-slate-800"}`}>:</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(e.target.value)}
                className={`w-16 h-12 text-center text-xl bg-transparent ${
                  isDarkMode ? "border-white/20 focus:border-white/40" : "border-slate-300 focus:border-slate-400"
                }`}
                placeholder="00"
              />
            </div>
          )}
          <div className={`text-xs ${isDarkMode ? "text-white/60" : "text-slate-500"} mt-2`}>
            {completed ? "Completed!" : running ? "Running" : initialTime > 0 ? "Paused" : "Set Timer"}
          </div>
        </div>
      </motion.div>

      {initialTime === 0 && !completed && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap justify-center">
            {[1, 5, 10].map((mins) => (
              <motion.div key={mins} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
                <Button
                  variant="outline"
                  className={
                    isDarkMode
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-slate-100 border-slate-200 hover:bg-slate-200"
                  }
                  onClick={() => setPresetTime(mins)}
                >
                  {mins} min
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mb-6 w-full">
            <Select value={selectedPreset} onValueChange={applyPreset}>
              <SelectTrigger
                className={`w-full ${
                  isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Workout Presets" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WORKOUT_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>
                        {preset.name} ({preset.minutes}:{preset.seconds.toString().padStart(2, "0")})
                      </span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

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
            disabled={initialTime === 0 && !completed}
          >
            <RotateCcw className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-slate-700"}`} />
          </Button>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          animate={{
            boxShadow: running
              ? ["0 0 0 rgba(6, 182, 212, 0)", "0 0 20px rgba(6, 182, 212, 0.5)", "0 0 0 rgba(6, 182, 212, 0)"]
              : completed
                ? "0 0 20px rgba(16, 185, 129, 0.5)"
                : "0 0 0 rgba(6, 182, 212, 0)",
          }}
          transition={{ duration: 2, repeat: running ? Number.POSITIVE_INFINITY : 0 }}
        >
          <Button
            size="icon"
            className={`w-16 h-16 rounded-full ${
              completed
                ? "bg-green-600 hover:bg-green-500"
                : running
                  ? "bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 hover:from-cyan-500 hover:via-violet-500 hover:to-fuchsia-500"
                  : "bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 hover:from-cyan-500 hover:via-violet-500 hover:to-fuchsia-500"
            }`}
            onClick={handleStartStop}
            disabled={completed || (initialTime === 0 && inputMinutes === "" && inputSeconds === "")}
          >
            {completed ? (
              <Check className="h-6 w-6 text-white" />
            ) : running ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-1" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
