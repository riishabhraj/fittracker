import { forwardRef } from "react"

interface ShareCardProps {
  workoutName: string
  duration: number
  sets: number
  reps: number
  weight: number
  prCount: number
}

/**
 * Hidden card that html2canvas screenshots for the share image.
 * MUST use inline hex/rgb colors — html2canvas cannot resolve CSS variables.
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ workoutName, duration, sets, reps, weight, prCount }, ref) => {
    const stats = [
      { label: "Duration", value: `${duration}m` },
      { label: "Sets",     value: String(sets) },
      { label: "Reps",     value: String(reps) },
      { label: "Volume",   value: weight >= 1000 ? `${(weight / 1000).toFixed(1)}k kg` : `${weight} kg` },
    ]

    return (
      <div
        ref={ref}
        style={{
          width: "360px",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
          borderRadius: "20px",
          padding: "28px",
          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
          border: "1px solid #2a2a2a",
          boxSizing: "border-box",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px", height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(170,255,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px",
              }}
            >
              {prCount > 0 ? "🏆" : "🎉"}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: "#aaff00", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Workout Complete
              </p>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f5f5f5", marginTop: "1px" }}>
                {workoutName}
              </p>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "#888", fontWeight: 500 }}>FitTracker</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          {stats.map(({ label, value }) => (
            <div
              key={label}
              style={{
                backgroundColor: "#1c1c1c",
                borderRadius: "12px",
                padding: "14px 12px",
                border: "1px solid #2a2a2a",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#f5f5f5", lineHeight: 1 }}>{value}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#888", marginTop: "4px", fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* PR callout */}
        {prCount > 0 && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "rgba(234,179,8,0.1)",
              border: "1px solid rgba(234,179,8,0.3)",
              borderRadius: "10px", padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "14px" }}>🏆</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#ca8a04", fontWeight: 600 }}>
              {prCount} New Personal Record{prCount > 1 ? "s" : ""}!
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            paddingTop: "14px",
            borderTop: "1px solid #2a2a2a",
          }}
        >
          <div
            style={{
              width: "28px", height: "4px", borderRadius: "2px",
              backgroundColor: "#aaff00", marginRight: "10px",
            }}
          />
          <p style={{ margin: 0, fontSize: "11px", color: "#666", fontWeight: 500, letterSpacing: "0.05em" }}>
            Track your gains with FitTracker
          </p>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = "ShareCard"
