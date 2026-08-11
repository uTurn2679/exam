"use client";

import { useEffect, useState } from "react";
import { Clock, Timer, CheckCircle2, AlertCircle } from "lucide-react";

type Props = {
  startTime: string | Date;
  endTime: string | Date;
  durationMinutes: number;
};

export default function ExamLiveCountdown({ startTime, endTime, durationMinutes }: Props) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [status, setStatus] = useState<"UPCOMING" | "ACTIVE" | "ENDED">("UPCOMING");

  useEffect(() => {
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();

    const updateTimer = () => {
      const nowMs = Date.now();

      if (nowMs < startMs) {
        // Exam has not started yet -> "Starts In" countdown
        setStatus("UPCOMING");
        const diffSec = Math.floor((startMs - nowMs) / 1000);
        
        const hours = Math.floor(diffSec / 3600);
        const mins = Math.floor((diffSec % 3600) / 60);
        const secs = diffSec % 60;

        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeLeftStr(`Starts in ${days} day(s) ${hours % 24}h`);
        } else if (hours > 0) {
          setTimeLeftStr(`Starts in ${hours}h ${mins}m ${secs}s`);
        } else {
          setTimeLeftStr(`Starts in ${mins}m ${secs}s`);
        }

      } else if (nowMs >= startMs && nowMs <= endMs) {
        // Exam is currently active -> "Ends In" countdown
        setStatus("ACTIVE");
        const diffSec = Math.floor((endMs - nowMs) / 1000);

        const hours = Math.floor(diffSec / 3600);
        const mins = Math.floor((diffSec % 3600) / 60);
        const secs = diffSec % 60;

        if (hours > 0) {
          setTimeLeftStr(`Ends in ${hours}h ${mins}m ${secs}s`);
        } else {
          setTimeLeftStr(`Ends in ${mins}m ${secs}s`);
        }

      } else {
        // Exam has concluded
        setStatus("ENDED");
        setTimeLeftStr("Concluded");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const startDateObj = new Date(startTime);
  const endDateObj = new Date(endTime);

  const formattedStartTime = startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedEndTime = endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedStartDate = startDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Live Badge Status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
        <span style={{
          fontSize: "0.775rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          padding: "0.35rem 0.8rem",
          borderRadius: "9999px",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: status === "ACTIVE" ? "#e0e7ff" : status === "UPCOMING" ? "#fef3c7" : "#f1f5f9",
          color: status === "ACTIVE" ? "#3730a3" : status === "UPCOMING" ? "#b45309" : "#64748b",
          border: status === "ACTIVE" ? "1px solid #c7d2fe" : status === "UPCOMING" ? "1px solid #fde68a" : "1px solid #e2e8f0"
        }}>
          {status === "ACTIVE" ? (
            <>
              <span className="animate-pulse-glow" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
              🟢 Running (Ends Soon)
            </>
          ) : status === "UPCOMING" ? (
            <>
              <Timer size={14} color="#b45309" />
              ⏳ Upcoming Session
            </>
          ) : (
            <>
              <CheckCircle2 size={14} color="#64748b" />
              🔴 Ended
            </>
          )}
        </span>

        {/* Live Countdown Clock */}
        <span style={{
          fontSize: "0.825rem",
          fontWeight: 800,
          fontFamily: "monospace, sans-serif",
          color: status === "ACTIVE" ? "#4f46e5" : status === "UPCOMING" ? "#d97706" : "#64748b",
          background: status === "ACTIVE" ? "#f5f3ff" : status === "UPCOMING" ? "#fffbeb" : "#f8fafc",
          padding: "0.3rem 0.75rem",
          borderRadius: "0.6rem",
          border: status === "ACTIVE" ? "1px solid #ddd6fe" : status === "UPCOMING" ? "1px solid #fde68a" : "1px solid #e2e8f0",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem"
        }}>
          <Clock size={14} /> {timeLeftStr}
        </span>
      </div>

      {/* Start Time & End Time Detail */}
      <div style={{
        fontSize: "0.825rem",
        color: "#475569",
        background: "#f8fafc",
        padding: "0.65rem 0.85rem",
        borderRadius: "0.65rem",
        border: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span><strong>Starts:</strong> {formattedStartDate}, {formattedStartTime}</span>
        <span><strong>Ends:</strong> {formattedEndTime}</span>
      </div>
    </div>
  );
}
