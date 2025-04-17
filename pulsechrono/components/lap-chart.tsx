"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

type Lap = {
  id: number
  time: number
  formattedTime: string
  type: "normal" | "fastest" | "slowest"
}

interface LapChartProps {
  laps: Lap[]
  isDarkMode: boolean
}

export default function LapChart({ laps, isDarkMode }: LapChartProps) {
  const chartData = useMemo(() => {
    // Reverse the laps to show in chronological order
    return [...laps].reverse().map((lap, index) => ({
      name: `Lap ${index + 1}`,
      time: lap.time / 1000, // Convert to seconds for better readability
      type: lap.type,
    }))
  }, [laps])

  const avgTime = useMemo(() => {
    if (laps.length === 0) return 0
    const total = laps.reduce((sum, lap) => sum + lap.time, 0)
    return total / laps.length / 1000 // Convert to seconds
  }, [laps])

  const getBarColor = (type: string) => {
    switch (type) {
      case "fastest":
        return "#06b6d4" // cyan
      case "slowest":
        return "#d946ef" // fuchsia
      default:
        return "#8b5cf6" // violet
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          className={`p-2 rounded-md ${isDarkMode ? "bg-slate-800" : "bg-white"} shadow-md border ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}
        >
          <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-800"}`}>{data.name}</p>
          <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>Time: {data.time.toFixed(2)}s</p>
          <p
            className={`text-xs ${
              data.type === "fastest"
                ? "text-cyan-500"
                : data.type === "slowest"
                  ? "text-fuchsia-500"
                  : isDarkMode
                    ? "text-slate-400"
                    : "text-slate-500"
            }`}
          >
            {data.type === "fastest" ? "Fastest Lap" : data.type === "slowest" ? "Slowest Lap" : "Normal Lap"}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`w-full h-[150px] rounded-md p-2 ${isDarkMode ? "bg-slate-800/50" : "bg-white"}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={isDarkMode ? "#94a3b8" : "#64748b"} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke={isDarkMode ? "#94a3b8" : "#64748b"}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}s`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgTime}
            stroke={isDarkMode ? "#e2e8f0" : "#475569"}
            strokeDasharray="3 3"
            label={{
              value: "Avg",
              position: "insideBottomRight",
              fill: isDarkMode ? "#e2e8f0" : "#475569",
              fontSize: 10,
            }}
          />
          <Bar
            dataKey="time"
            radius={[4, 4, 0, 0]}
            fill="#8b5cf6"
            fillOpacity={0.8}
            stroke={isDarkMode ? "#1e293b" : "#f8fafc"}
            strokeWidth={1}
            animationDuration={500}
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
              <Bar key={`bar-${index}`} fill={getBarColor(entry.type)} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
