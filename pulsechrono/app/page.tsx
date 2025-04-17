"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Timer from "@/components/timer"
import Stopwatch from "@/components/stopwatch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ThemeToggle from "@/components/theme-toggle"
import VoiceCommandIndicator from "@/components/voice-command-indicator"
import { useTheme } from "next-themes"

export default function PulseChrono() {
  const [activeTab, setActiveTab] = useState("stopwatch")
  const [isActive, setIsActive] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  // Handle voice commands (simulated)
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceCommand, setVoiceCommand] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulate voice command processing
  useEffect(() => {
    if (voiceCommand) {
      const timer = setTimeout(() => {
        processVoiceCommand(voiceCommand)
        setVoiceCommand("")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [voiceCommand])

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()
    if (lowerCommand.includes("start")) {
      // Handle start command
      setIsActive(true)
      // Additional logic would be handled in child components
    } else if (lowerCommand.includes("stop") || lowerCommand.includes("pause")) {
      // Handle stop command
      setIsActive(false)
      // Additional logic would be handled in child components
    } else if (lowerCommand.includes("timer")) {
      setActiveTab("timer")
    } else if (lowerCommand.includes("stopwatch")) {
      setActiveTab("stopwatch")
    } else if (lowerCommand.includes("lap")) {
      // Lap command would be handled in child components
    }
  }

  // Simulate voice activation
  const toggleVoiceCommand = () => {
    setVoiceActive(!voiceActive)
    if (!voiceActive) {
      setVoiceCommand("Listening...")
      // Simulate a voice command after a delay
      setTimeout(() => {
        const commands = ["Start timer", "Start stopwatch", "Stop", "Lap", "Switch to timer", "Switch to stopwatch"]
        const randomCommand = commands[Math.floor(Math.random() * commands.length)]
        setVoiceCommand(randomCommand)
      }, 2000)
    } else {
      setVoiceCommand("")
    }
  }

  if (!mounted) return null

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-300 ${isDarkMode ? "bg-black" : "bg-gray-50"}`}
    >
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: isActive
            ? isDarkMode
              ? [
                  "radial-gradient(circle, rgba(88,28,135,0.8) 0%, rgba(15,23,42,1) 100%)",
                  "radial-gradient(circle, rgba(76,29,149,0.8) 0%, rgba(15,23,42,1) 100%)",
                  "radial-gradient(circle, rgba(124,58,237,0.8) 0%, rgba(15,23,42,1) 100%)",
                  "radial-gradient(circle, rgba(88,28,135,0.8) 0%, rgba(15,23,42,1) 100%)",
                ]
              : [
                  "radial-gradient(circle, rgba(233,213,255,1) 0%, rgba(248,250,252,1) 100%)",
                  "radial-gradient(circle, rgba(216,180,254,1) 0%, rgba(248,250,252,1) 100%)",
                  "radial-gradient(circle, rgba(192,132,252,1) 0%, rgba(248,250,252,1) 100%)",
                  "radial-gradient(circle, rgba(233,213,255,1) 0%, rgba(248,250,252,1) 100%)",
                ]
            : isDarkMode
              ? "radial-gradient(circle, rgba(30,41,59,0.8) 0%, rgba(15,23,42,1) 100%)"
              : "radial-gradient(circle, rgba(241,245,249,1) 0%, rgba(248,250,252,1) 100%)",
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <VoiceCommandIndicator active={voiceActive} command={voiceCommand} onClick={toggleVoiceCommand} />
        <ThemeToggle />
      </div>

      <motion.h1
        className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-cyan-400 to-fuchsia-500 mb-8 z-10`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        PulseChrono
      </motion.h1>

      <motion.div
        className={`w-full max-w-md ${
          isDarkMode ? "bg-slate-900/60" : "bg-white/80"
        } backdrop-blur-lg rounded-3xl p-6 border ${
          isDarkMode ? "border-white/10" : "border-slate-200"
        } shadow-lg z-10`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger
              value="stopwatch"
              className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Stopwatch
            </TabsTrigger>
            <TabsTrigger
              value="timer"
              className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-violet-500 data-[state=active]:text-white ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Timer
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="stopwatch" className="mt-0">
              <Stopwatch setIsActive={setIsActive} voiceCommand={voiceCommand} />
            </TabsContent>
            <TabsContent value="timer" className="mt-0">
              <Timer setIsActive={setIsActive} voiceCommand={voiceCommand} />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  )
}
