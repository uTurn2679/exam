"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface ExamTimerProps {
  startTime: string | Date;
  durationMinutes: number;
  onTimeUp: () => void;
}

export default function ExamTimer({ startTime, durationMinutes, onTimeUp }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timeUpTriggered = useRef(false);

  useEffect(() => {
    const startMs = new Date(startTime).getTime();
    const totalDurationMs = durationMinutes * 60 * 1000;
    const endMs = startMs + totalDurationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remainingMs = endMs - now;

      if (remainingMs <= 0) {
        setSecondsLeft(0);
        if (!timeUpTriggered.current) {
          timeUpTriggered.current = true;
          onTimeUp();
        }
      } else {
        setSecondsLeft(Math.floor(remainingMs / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onTimeUp]);

  if (secondsLeft === null) {
    return <div className="animate-pulse h-10 w-36 bg-gray-700/50 rounded-lg"></div>;
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const isWarning = secondsLeft <= 300 && secondsLeft > 120; // 2 - 5 mins
  const isUrgent = secondsLeft <= 120; // < 2 mins

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        padding: "0.5rem 1.25rem",
        borderRadius: "0.75rem",
        border: "1px solid",
        backdropFilter: "blur(8px)",
        background: isUrgent ? "rgba(153, 27, 27, 0.9)" : isWarning ? "rgba(180, 83, 9, 0.9)" : "rgba(15, 23, 42, 0.9)",
        borderColor: isUrgent ? "#ef4444" : isWarning ? "#f59e0b" : "#3b82f6",
        color: "white"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {isUrgent || isWarning ? (
          <AlertTriangle size={18} color={isUrgent ? "#fca5a5" : "#fcd34d"} />
        ) : (
          <Clock size={18} color="#60a5fa" />
        )}
        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#e2e8f0" }}>Time Remaining</span>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "1.35rem", fontWeight: 900, letterSpacing: "0.1em" }}>
        {formattedTime}
      </div>
    </div>
  );
}
